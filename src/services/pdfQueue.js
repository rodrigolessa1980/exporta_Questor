// Serviço para gerenciar fila de requisições de PDFs
class PdfQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.webhookUrl = 'https://dadosbi.monkeybranch.com.br/webhook/req';
    this.maxRetries = 3;
    this.retryDelay = 2000; // 2 segundos
  }

  // Adiciona um PDF à fila
  addPdfToQueue(file, onProgress, onComplete, onError) {
    const queueItem = {
      id: Date.now() + Math.random(),
      file: file,
      status: 'pending',
      retries: 0,
      onProgress,
      onComplete,
      onError,
      timestamp: new Date().toISOString()
    };

    this.queue.push(queueItem);
    console.log(`PDF adicionado à fila: ${file.name} (ID: ${queueItem.id})`);
    
    // Inicia o processamento se não estiver em andamento
    if (!this.isProcessing) {
      this.processQueue();
    }

    return queueItem.id;
  }

  // Processa a fila de PDFs
  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    console.log(`Iniciando processamento da fila. Total de itens: ${this.queue.length}`);

    while (this.queue.length > 0) {
      const item = this.queue.shift();
      
      try {
        console.log(`Processando PDF: ${item.file.name} (ID: ${item.id})`);
        item.status = 'processing';
        
        if (item.onProgress) {
          item.onProgress(item.id, 'processing', `Processando ${item.file.name}...`);
        }

        const responseResult = await this.sendPdfToWebhook(item);
        
        item.status = 'completed';
        console.log(`PDF processado com sucesso: ${item.file.name}`);
        
        if (item.onComplete) {
          item.onComplete(item.id, `PDF ${item.file.name} enviado com sucesso!`, responseResult);
        }

      } catch (error) {
        console.error(`Erro ao processar PDF ${item.file.name}:`, error);
        
        // Tenta novamente se não excedeu o limite de tentativas
        if (item.retries < this.maxRetries) {
          item.retries++;
          item.status = 'retrying';
          console.log(`Tentativa ${item.retries}/${this.maxRetries} para ${item.file.name}`);
          
          // Adiciona de volta à fila com delay
          setTimeout(() => {
            this.queue.unshift(item);
            this.processQueue();
          }, this.retryDelay * item.retries);
          
          if (item.onProgress) {
            item.onProgress(item.id, 'retrying', `Tentativa ${item.retries}/${this.maxRetries} para ${item.file.name}...`);
          }
        } else {
          item.status = 'failed';
          console.error(`PDF ${item.file.name} falhou após ${this.maxRetries} tentativas`);
          
          if (item.onError) {
            item.onError(item.id, `Erro ao processar ${item.file.name}: ${error.message}`);
          }
        }
      }
    }

    this.isProcessing = false;
    console.log('Fila de processamento finalizada');
  }

  // Envia PDF para o webhook
  async sendPdfToWebhook(queueItem) {
    const formData = new FormData();
    formData.append('pdf', queueItem.file);
    formData.append('filename', queueItem.file.name);
    formData.append('timestamp', queueItem.timestamp);

    console.log(`Enviando PDF para webhook: ${queueItem.file.name}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 segundos de timeout

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST', // Usando POST conforme solicitado
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
      }

      // Tenta fazer parse do JSON retornado
      let result;
      try {
        result = await response.json();
        console.log(`Resposta JSON do webhook para ${queueItem.file.name}:`, result);
      } catch (parseError) {
        // Se não for JSON, retorna como texto
        result = await response.text();
        console.log(`Resposta texto do webhook para ${queueItem.file.name}:`, result);
      }
      
      return result;

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Timeout: A requisição demorou mais de 60 segundos para responder');
      }
      
      throw error;
    }
  }

  // Obtém status da fila
  getQueueStatus() {
    return {
      total: this.queue.length,
      processing: this.isProcessing,
      pending: this.queue.filter(item => item.status === 'pending').length,
      completed: this.queue.filter(item => item.status === 'completed').length,
      failed: this.queue.filter(item => item.status === 'failed').length
    };
  }

  // Limpa a fila
  clearQueue() {
    this.queue = [];
    this.isProcessing = false;
    console.log('Fila de PDFs limpa');
  }

  // Remove item específico da fila
  removeFromQueue(itemId) {
    const index = this.queue.findIndex(item => item.id === itemId);
    if (index !== -1) {
      const removed = this.queue.splice(index, 1)[0];
      console.log(`Item removido da fila: ${removed.file.name}`);
      return removed;
    }
    return null;
  }
}

// Instância singleton da fila
export const pdfQueue = new PdfQueue();

// Função helper para adicionar PDFs à fila
export const addPdfToQueue = (file, onProgress, onComplete, onError) => {
  return pdfQueue.addPdfToQueue(file, onProgress, onComplete, onError);
};

// Função helper para obter status da fila
export const getQueueStatus = () => {
  return pdfQueue.getQueueStatus();
};

// Função helper para limpar a fila
export const clearQueue = () => {
  return pdfQueue.clearQueue();
};
