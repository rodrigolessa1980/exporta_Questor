import * as XLSX from 'xlsx';
import { findNaturezaMapping } from '../data/natureza-mapping';
import { addPdfToQueue, getQueueStatus, clearQueue } from './pdfQueue';
import parseNfseText from './textParsers';

// Função para processar arquivos Excel
export const processExcelFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Processa a primeira planilha (dados das notas)
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        
        // Remove cabeçalhos e processa dados
        const headers = jsonData[0];
        const rows = jsonData.slice(1);
        
        const processedData = rows.map(row => {
          const item = {};
          headers.forEach((header, index) => {
            if (header && row[index] !== undefined) {
              // Normaliza os nomes das colunas
              const normalizedHeader = header.toString().toLowerCase().trim();
              let value = row[index];
              
              // Converte valores numéricos
              if (typeof value === 'string' && value.includes(',')) {
                value = parseFloat(value.replace(',', '.'));
              }
              
              // Mapeia colunas para o formato padrão
              switch (normalizedHeader) {
                case '#natureza':
                case 'natureza':
                  item.natureza = value;
                  break;
                case 'data emissão':
                case 'dataemissao':
                  item.dataEmissao = value;
                  break;
                case 'data entrada':
                case 'dataentrada':
                  item.dataEntrada = value;
                  break;
                case 'numero nota':
                case 'numeronota':
                  item.numeroNota = value;
                  break;
                case 'inscrição federal':
                case 'inscricaofederal':
                  item.inscricaoFederal = value;
                  break;
                case 'razao social':
                case 'razaosocial':
                  item.razaoSocial = value;
                  break;
                case 'cfop natureza':
                case 'cfopnatureza':
                  item.cfopNatureza = value;
                  break;
                case 'valor principal':
                case 'valorprincipal':
                  item.valorPrincipal = value;
                  break;
                case 'inss retid':
                case 'inssretid':
                  item.inssRetid = value;
                  break;
                case 'iss retid':
                case 'issretid':
                  item.issRetid = value;
                  break;
                case 'pis retid':
                case 'pisretid':
                  item.pisRetid = value;
                  break;
                case 'cofins retid':
                case 'cofinsretid':
                  item.cofinsRetid = value;
                  break;
                case 'cs retid':
                case 'csretid':
                  item.csRetid = value;
                  break;
                case 'ir retid':
                case 'irretid':
                  item.irRetid = value;
                  break;
                case 'valor liquido':
                case 'valorliquido':
                  item.valorLiquido = value;
                  break;
                case 'tabela ctb':
                case 'tabelactb':
                  item.tabelaCtb = value;
                  break;
                default:
                  item[header] = value;
              }
            }
          });
          
          // Aplica mapeamento automático baseado na natureza
          if (item.natureza) {
            const naturezaMapping = findNaturezaMapping(item.natureza);
            if (naturezaMapping) {
              // Sempre aplica o mapeamento correto da natureza
              item.cfopNatureza = naturezaMapping.cfop;
              item.tabelaCtb = naturezaMapping.tabelaCtb;
            }
          }
          
          return item;
        }).filter(item => Object.keys(item).length > 0);
        
        resolve(processedData);
      } catch (error) {
        reject(new Error(`Erro ao processar arquivo Excel: ${error.message}`));
      }
    };
    
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsArrayBuffer(file);
  });
};

// Função para processar arquivos XML usando DOMParser nativo
export const processXmlFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const xmlContent = e.target.result;
        
        // Usa DOMParser nativo do navegador
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
        
        // Verifica se há erros de parsing
        const parseError = xmlDoc.getElementsByTagName("parsererror");
        if (parseError.length > 0) {
          reject(new Error('Erro ao fazer parse do XML'));
          return;
        }
        
        try {
          // Detecta o tipo de arquivo XML
          let xmlType = null;
          let rootElement = null;
          
          // Verifica se é NFe
          if (xmlDoc.querySelector('nfeProc NFe infNFe') || 
              xmlDoc.querySelector('NFe infNFe') ||
              xmlDoc.querySelector('infNFe')) {
            xmlType = 'NFe';
            rootElement = xmlDoc.querySelector('nfeProc NFe infNFe') || 
                         xmlDoc.querySelector('NFe infNFe') ||
                         xmlDoc.querySelector('infNFe');
          }
          // Verifica se é NFSe
          else if (xmlDoc.querySelector('ConsultarNfseResposta ListaNfse CompNfse Nfse InfNfse') ||
                   xmlDoc.querySelector('ListaNfse CompNfse Nfse InfNfse') ||
                   xmlDoc.querySelector('CompNfse Nfse InfNfse') ||
                   xmlDoc.querySelector('InfNfse')) {
            xmlType = 'NFSe';
            rootElement = xmlDoc.querySelector('ConsultarNfseResposta ListaNfse CompNfse Nfse InfNfse') ||
                         xmlDoc.querySelector('ListaNfse CompNfse Nfse InfNfse') ||
                         xmlDoc.querySelector('CompNfse Nfse InfNfse') ||
                         xmlDoc.querySelector('InfNfse');
          }
          
          if (!rootElement) {
            reject(new Error('Estrutura XML inválida - arquivo deve ser uma NFe (Nota Fiscal Eletrônica) ou NFSe (Nota Fiscal de Serviços Eletrônica) válida'));
            return;
          }
          
          // Função helper para extrair texto de elementos
          const getElementText = (parent, tagName) => {
            const element = parent.querySelector(tagName);
            return element ? element.textContent.trim() : '';
          };
          
          let processedData;
          
          if (xmlType === 'NFe') {
            // Processa NFe
            const ide = rootElement.querySelector('ide');
            const dest = rootElement.querySelector('dest');
            const total = rootElement.querySelector('total ICMSTot');
            
            const natureza = getElementText(ide, 'natOp');
            const cfop = getElementText(ide, 'CFOP');
            
            // Aplica mapeamento automático baseado na natureza
            let cfopNatureza = cfop;
            let tabelaCtb = '';
            
            if (natureza) {
              const naturezaMapping = findNaturezaMapping(natureza);
              if (naturezaMapping) {
                cfopNatureza = naturezaMapping.cfop;
                tabelaCtb = naturezaMapping.tabelaCtb;
              }
            }
            
            processedData = {
              natureza: natureza,
              dataEmissao: getElementText(ide, 'dhEmi') ? new Date(getElementText(ide, 'dhEmi')).toISOString() : '',
              dataEntrada: getElementText(ide, 'dhSaiEnt') ? new Date(getElementText(ide, 'dhSaiEnt')).toISOString() : '',
              numeroNota: getElementText(ide, 'nNF'),
              inscricaoFederal: getElementText(dest, 'CNPJ') || getElementText(dest, 'CPF'),
              razaoSocial: getElementText(dest, 'xNome'),
              cfop: cfop,
              cfopNatureza: cfopNatureza,
              tabelaCtb: tabelaCtb,
              valorPrincipal: parseFloat(getElementText(total, 'vProd') || '0'),
              inssRetid: 0,
              issRetid: 0,
              pisRetid: 0,
              cofinsRetid: 0,
              csRetid: 0,
              irRetid: 0,
              valorLiquido: parseFloat(getElementText(total, 'vNF') || '0')
            };
          } else if (xmlType === 'NFSe') {
            // Processa NFSe
            const servico = rootElement.querySelector('Servico');
            const prestador = rootElement.querySelector('PrestadorServico');
            const tomador = rootElement.querySelector('TomadorServico');
            const valores = servico ? servico.querySelector('Valores') : null;
            
            const natureza = getElementText(rootElement, 'NaturezaOperacao');
            const cfop = getElementText(servico, 'ItemListaServico');
            
            // Aplica mapeamento automático baseado na natureza
            let cfopNatureza = cfop;
            let tabelaCtb = '';
            
            if (natureza) {
              const naturezaMapping = findNaturezaMapping(natureza);
              if (naturezaMapping) {
                cfopNatureza = naturezaMapping.cfop;
                tabelaCtb = naturezaMapping.tabelaCtb;
              }
            }
            
            processedData = {
              natureza: natureza,
              dataEmissao: getElementText(rootElement, 'DataEmissao') ? new Date(getElementText(rootElement, 'DataEmissao')).toISOString() : '',
              dataEntrada: getElementText(rootElement, 'DataEmissao') ? new Date(getElementText(rootElement, 'DataEmissao')).toISOString() : '', // NFSe usa data de emissão
              numeroNota: getElementText(rootElement, 'Numero'),
              inscricaoFederal: getElementText(tomador, 'Cnpj') || getElementText(tomador, 'Cpf'),
              razaoSocial: getElementText(tomador, 'RazaoSocial'),
              cfop: cfop,
              cfopNatureza: cfopNatureza,
              tabelaCtb: tabelaCtb,
              valorPrincipal: parseFloat(getElementText(valores, 'ValorServicos') || '0'),
              inssRetid: parseFloat(getElementText(valores, 'ValorInss') || '0'),
              issRetid: parseFloat(getElementText(valores, 'ValorIss') || '0'),
              pisRetid: parseFloat(getElementText(valores, 'ValorPis') || '0'),
              cofinsRetid: parseFloat(getElementText(valores, 'ValorCofins') || '0'),
              csRetid: parseFloat(getElementText(valores, 'ValorCsll') || '0'),
              irRetid: parseFloat(getElementText(valores, 'ValorIr') || '0'),
              valorLiquido: parseFloat(getElementText(valores, 'ValorLiquidoNfse') || '0')
            };
          }
          
          if (!processedData) {
            reject(new Error('Erro ao processar dados do XML'));
            return;
          }
          
          resolve([processedData]);
        } catch (parseError) {
          reject(new Error(`Erro ao extrair dados do XML: ${parseError.message}`));
        }
      } catch (error) {
        reject(new Error(`Erro ao processar arquivo XML: ${error.message}`));
      }
    };
    
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsText(file);
  });
};

// Função para processar arquivo de mapeamento CFOP
export const processCfopMappingFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Processa a segunda planilha (mapeamento CFOP)
        const secondSheet = workbook.Sheets[workbook.SheetNames[1]];
        const jsonData = XLSX.utils.sheet_to_json(secondSheet, { header: 1 });
        
        // Remove cabeçalhos e processa dados
        const headers = jsonData[0];
        const rows = jsonData.slice(1);
        
        const cfopMapping = {};
        rows.forEach(row => {
          const cfop = row[headers.findIndex(h => h === 'CFOP')];
          const descricao = row[headers.findIndex(h => h === 'Descrição CFOP')];
          const tabelaCtb = row[headers.findIndex(h => h === 'TABELA CTB')];
          const contaContabil = row[headers.findIndex(h => h === 'CONTA CONTÁBIL')];
          
          if (cfop) {
            cfopMapping[cfop] = {
              descricao: descricao || '',
              tabelaCtb: tabelaCtb || '',
              contaContabil: contaContabil || ''
            };
          }
        });
        
        resolve(cfopMapping);
      } catch (error) {
        reject(new Error(`Erro ao processar arquivo de mapeamento CFOP: ${error.message}`));
      }
    };
    
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsArrayBuffer(file);
  });
};

// Função para exportar dados para Excel
export const exportToExcel = (data, filename = 'notas_fiscais_exportadas.xlsx') => {
  try {
    // Define as colunas na ordem especificada para exportação
    const columns = [
      '#NATUREZA',
      'Data Emissão',
      'Data Entrada',
      'Numero Nota',
      'Inscrição Federal',
      'Razao Social',
      'CFOP Natureza',
      'Valor Principal',
      'INSS Retid',
      'ISS Retid',
      'PIS Retid',
      'Cofins Retid',
      'CS Retid',
      'IR Retid',
      'Valor Liquido',
      'TABELA CTB'
    ];
    
    // Prepara os dados para exportação
    const exportData = data.map(item => [
      item.natureza || '',
      item.dataEmissao ? new Date(item.dataEmissao).toLocaleDateString('pt-BR') : '',
      item.dataEntrada ? new Date(item.dataEntrada).toLocaleDateString('pt-BR') : '',
      item.numeroNota || '',
      item.inscricaoFederal || '',
      item.razaoSocial || '',
      item.cfopNatureza || item.cfop || '',
      item.valorPrincipal || 0,
      item.inssRetid || 0,
      item.issRetid || 0,
      item.pisRetid || 0,
      item.cofinsRetid || 0,
      item.csRetid || 0,
      item.irRetid || 0,
      item.valorLiquido || 0,
      item.tabelaCtb || ''
    ]);
    
    // Cria a planilha
    const ws = XLSX.utils.aoa_to_sheet([columns, ...exportData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Notas Fiscais');
    
    // Aplica formatação
    ws['!cols'] = columns.map(() => ({ width: 15 }));
    
    // Exporta o arquivo
    XLSX.writeFile(wb, filename);
    
    return true;
  } catch (error) {
    console.error('Erro ao exportar para Excel:', error);
    throw new Error(`Erro ao exportar para Excel: ${error.message}`);
  }
};

// Função para exportar dados para webhook
export const exportToWebhook = async (data, webhookUrl) => {
  try {
    console.log('=== INICIANDO EXPORTAÇÃO PARA WEBHOOK ===');
    console.log('URL:', webhookUrl);
    console.log('Total de registros:', data.length);
    console.log('Primeiro registro:', data[0]);
    
    // Validação dos dados
    if (!data || data.length === 0) {
      throw new Error('Nenhum dado para enviar');
    }
    
    if (!webhookUrl || webhookUrl.trim() === '') {
      throw new Error('URL do webhook não fornecida');
    }

    // Prepara os dados para envio no formato esperado pelo webhook
    const webhookData = {
      timestamp: new Date().toISOString(),
      totalRegistros: data.length,
      dados: data.map(item => ({
        natureza: item.natureza || '',
        dataEmissao: item.dataEmissao ? new Date(item.dataEmissao).toLocaleDateString('pt-BR') : '',
        dataEntrada: item.dataEntrada ? new Date(item.dataEntrada).toLocaleDateString('pt-BR') : '',
        numeroNota: item.numeroNota || '',
        inscricaoFederal: item.inscricaoFederal || '',
        razaoSocial: item.razaoSocial || '',
        cfopNatureza: item.cfopNatureza || item.cfop || '',
        valorPrincipal: item.valorPrincipal || 0,
        inssRetid: item.inssRetid || 0,
        issRetid: item.issRetid || 0,
        pisRetid: item.pisRetid || 0,
        cofinsRetid: item.cofinsRetid || 0,
        csRetid: item.csRetid || 0,
        irRetid: item.irRetid || 0,
        valorLiquido: item.valorLiquido || 0,
        tabelaCtb: item.tabelaCtb || ''
      }))
    };

    console.log('Dados preparados para envio:', webhookData);
    console.log('Tamanho dos dados (JSON):', JSON.stringify(webhookData).length, 'caracteres');

    // Cria um AbortController para timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos de timeout

    try {
      console.log('Fazendo requisição POST para o webhook...');
      
      // Faz a requisição POST para o webhook
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Sistema-Notas-Fiscais-Questor/1.0'
        },
        mode: 'cors',
        body: JSON.stringify(webhookData),
        signal: controller.signal
      });

      clearTimeout(timeoutId); // Limpa o timeout se a requisição foi bem-sucedida
      
      console.log('Resposta recebida do webhook:');
      console.log('- Status:', response.status);
      console.log('- Status Text:', response.statusText);
      console.log('- Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro HTTP na resposta:', errorText);
        throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}. Detalhes: ${errorText}`);
      }

      let result;
      try {
        result = await response.json();
        console.log('Resposta JSON processada com sucesso:', result);
      } catch (parseError) {
        console.warn('Não foi possível fazer parse da resposta como JSON, usando texto:', parseError);
        const responseText = await response.text();
        result = { message: responseText };
        console.log('Resposta como texto:', responseText);
      }

      console.log('=== EXPORTAÇÃO CONCLUÍDA COM SUCESSO ===');
      
      return {
        success: true,
        message: `Dados exportados com sucesso para o webhook. Total de registros: ${data.length}`,
        response: result
      };

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        throw new Error('Timeout: A requisição demorou mais de 30 segundos para responder');
      }
      
      throw fetchError;
    }

  } catch (error) {
    console.error('=== ERRO NA EXPORTAÇÃO PARA WEBHOOK ===');
    console.error('Tipo de erro:', error.name);
    console.error('Mensagem:', error.message);
    console.error('Stack trace:', error.stack);
    
    // Mensagem mais detalhada para o usuário
    let userMessage = 'Erro ao exportar para webhook';
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      userMessage = 'Erro de conexão. Verifique se o webhook está acessível.';
    } else if (error.message.includes('CORS')) {
      userMessage = 'Erro de CORS. O webhook não permite requisições deste domínio.';
    } else if (error.message.includes('Failed to fetch')) {
      userMessage = 'Falha na conexão com o webhook. Verifique a URL e conectividade.';
    } else if (error.message.includes('Timeout')) {
      userMessage = 'Timeout: O webhook demorou muito para responder.';
    } else if (error.message.includes('AbortError')) {
      userMessage = 'Requisição cancelada devido ao tempo limite.';
    } else {
      userMessage = error.message;
    }
    
    console.error('Mensagem de erro para o usuário:', userMessage);
    throw new Error(userMessage);
  }
};

// Normaliza a resposta do webhook para o formato interno de nota(s)
export const normalizeWebhookResponse = (responseData) => {
  try {
    let data = responseData;
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch {
        // Não é JSON válido
        return [];
      }
    }

    // Helper para extrair payload útil de diferentes formatos
    const extractPayloadFromEntry = (entry) => {
      if (!entry || typeof entry !== 'object') return entry;
      if (entry.output && typeof entry.output === 'object') return entry.output;
      if (entry.message && typeof entry.message === 'object') {
        if (entry.message.content && typeof entry.message.content === 'object') return entry.message.content;
        if (entry.message.output && typeof entry.message.output === 'object') return entry.message.output;
      }
      if (entry.content && typeof entry.content === 'object') return entry.content;
      return entry;
    };

    // Caso venha como um array de itens (ex.: [{ output: { ... } }])
    if (Array.isArray(data)) {
      const payloads = data
        .map(extractPayloadFromEntry)
        .flatMap(p => Array.isArray(p) ? p : [p]);
      return payloads.map((p) => {
        // Se vier como { text: "..." }, tenta parsear por regex
        if (p && typeof p === 'object' && typeof p.text === 'string') {
          const parsed = parseNfseText(p.text);
          return normalizeSingleWebhookItem(parsed);
        }
        return normalizeSingleWebhookItem(p);
      }).filter(Boolean);
    }

    // Caso venha no formato { dados: [...] }
    if (data && Array.isArray(data.dados)) {
      return data.dados.map((item) => normalizeSingleWebhookItem(item));
    }

    // Caso venha no formato { output: { ... } }
    if (data && typeof data === 'object' && data.output) {
      const p = data.output;
      if (p && typeof p === 'object' && typeof p.text === 'string') {
        const parsed = parseNfseText(p.text);
        return [normalizeSingleWebhookItem(parsed)];
      }
      return [normalizeSingleWebhookItem(p)];
    }

    // Caso venha no formato { message: { content: { ... } } }
    if (data && typeof data === 'object' && data.message && typeof data.message === 'object') {
      const payload = (data.message.content && typeof data.message.content === 'object')
        ? data.message.content
        : (data.message.output && typeof data.message.output === 'object')
          ? data.message.output
          : data.message;
      if (payload && typeof payload === 'object' && typeof payload.text === 'string') {
        const parsed = parseNfseText(payload.text);
        return [normalizeSingleWebhookItem(parsed)];
      }
      return [normalizeSingleWebhookItem(payload)];
    }

    // Caso venha no formato { content: { ... } }
    if (data && typeof data === 'object' && data.content && typeof data.content === 'object') {
      const payload = data.content;
      if (payload && typeof payload === 'object' && typeof payload.text === 'string') {
        const parsed = parseNfseText(payload.text);
        return [normalizeSingleWebhookItem(parsed)];
      }
      return [normalizeSingleWebhookItem(payload)];
    }

    // Caso venha como um único objeto plano
    if (data && typeof data === 'object') {
      return [normalizeSingleWebhookItem(data)];
    }

    return [];
  } catch (error) {
    console.error('Erro ao normalizar resposta do webhook:', error);
    return [];
  }
};

// Normaliza um único item do webhook
const normalizeSingleWebhookItem = (item) => {
  if (!item || typeof item !== 'object') return null;

  // Preferir dados do tomador quando disponíveis
  const razaoSocialFinal = item.razaoSocialTomador || item.razaoSocial || '';
  const inscricaoFederalFinal = item.inscricaoFederalTomador || item.inscricaoFederal || '';

  const normalized = {
    natureza: item.natureza || '',
    dataEmissao: item.dataEmissao || '',
    dataEntrada: item.dataEntrada || '',
    numeroNota: item.numeroNota || '',
    inscricaoFederal: inscricaoFederalFinal,
    razaoSocial: razaoSocialFinal,
    cfop: item.cfop || '',
    cfopNatureza: item.cfopNatureza || item.cfop || '',
    tabelaCtb: item.tabelaCtb || '',
    valorPrincipal: toNumber(item.valorPrincipal),
    inssRetid: toNumber(item.inssRetid),
    issRetid: toNumber(item.issRetid),
    pisRetid: toNumber(item.pisRetid),
    cofinsRetid: toNumber(item.cofinsRetid),
    csRetid: toNumber(item.csRetid),
    irRetid: toNumber(item.irRetid),
    valorLiquido: toNumber(item.valorLiquido)
  };

  // Aplica mapeamento automático baseado na natureza, se faltar cfopNatureza/tabelaCtb
  if (normalized.natureza) {
    try {
      const naturezaMapping = findNaturezaMapping(normalized.natureza);
      if (naturezaMapping) {
        if (!normalized.cfopNatureza) {
          normalized.cfopNatureza = naturezaMapping.cfop || normalized.cfop;
        }
        if (!normalized.tabelaCtb) {
          normalized.tabelaCtb = naturezaMapping.tabelaCtb || '';
        }
      }
    } catch (e) {
      // mapeamento opcional
    }
  }

  return normalized;
};

// Converte valores numéricos com segurança
const toNumber = (value) => {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const normalized = value.replace(/\./g, '').replace(',', '.');
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

// Função para processar arquivos PDF
export const processPdfFile = async (file, onProgress, onComplete, onError) => {
  try {
    console.log(`Iniciando processamento do PDF: ${file.name}`);
    
    // Adiciona o PDF à fila de processamento
    const queueId = addPdfToQueue(
      file,
      (id, status, message) => {
        console.log(`PDF ${id}: ${status} - ${message}`);
        if (onProgress) {
          onProgress(id, status, message);
        }
      },
      (id, message, responseData) => {
        console.log(`PDF ${id} processado: ${message}`);
        if (onComplete) {
          onComplete(id, message, responseData);
        }
      },
      (id, errorMessage) => {
        console.error(`Erro no PDF ${id}: ${errorMessage}`);
        if (onError) {
          onError(id, errorMessage);
        }
      }
    );

    return {
      success: true,
      message: `PDF ${file.name} adicionado à fila de processamento`,
      queueId: queueId
    };

  } catch (error) {
    console.error('Erro ao processar PDF:', error);
    throw new Error(`Erro ao processar PDF: ${error.message}`);
  }
};

// Função para obter status da fila de PDFs
export const getPdfQueueStatus = () => {
  return getQueueStatus();
};

// Função para limpar a fila de PDFs
export const clearPdfQueue = () => {
  return clearQueue();
};
