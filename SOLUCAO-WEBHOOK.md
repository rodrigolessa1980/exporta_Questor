# 🔧 Solução para Problema do Webhook

## 📋 Problema Identificado

O webhook não está enviando os dados corretamente. Vou fornecer uma solução passo a passo.

## 🚀 Passos para Resolver

### 1. **Teste o Webhook Independentemente**

Primeiro, teste se o webhook está funcionando usando o arquivo de teste:

```bash
# Abra no navegador:
test-webhook-simple.html
```

Este arquivo testa a conectividade básica com o webhook.

### 2. **Verifique o Console do Navegador**

Ao clicar no botão "Exportar Webhook":

1. Abra as **Ferramentas do Desenvolvedor** (F12)
2. Vá para a aba **Console**
3. Clique no botão "Exportar Webhook"
4. Verifique as mensagens de log

### 3. **Possíveis Problemas e Soluções**

#### **Problema A: Erro de CORS**
```
Access to fetch at 'https://dadosbi.monkeybranch.com.br/webhook/...' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solução:** O servidor webhook não permite requisições do localhost. Teste em produção ou configure o servidor.

#### **Problema B: Erro de Rede**
```
Failed to fetch
```

**Solução:** Verifique:
- Conectividade com a internet
- Se a URL está correta
- Se o servidor webhook está ativo

#### **Problema C: Timeout**
```
Timeout: A requisição demorou mais de 30 segundos para responder
```

**Solução:** O servidor está lento. Aumente o timeout ou verifique a performance.

#### **Problema D: Dados Vazios**
```
Nenhum dado para enviar
```

**Solução:** Verifique se há dados na tabela antes de exportar.

### 4. **Teste Manual no Console**

Execute este código no console do navegador para testar:

```javascript
// Teste manual do webhook
async function testManual() {
  try {
    const response = await fetch('https://dadosbi.monkeybranch.com.br/webhook/3af7dec8-78d6-4858-aaff-a9669f2129a0', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        totalRegistros: 1,
        dados: [{ teste: "dados" }]
      })
    });
    
    console.log('Status:', response.status);
    console.log('Resposta:', await response.text());
  } catch (error) {
    console.error('Erro:', error);
  }
}

testManual();
```

### 5. **Verificação de Dados**

Antes de exportar, verifique se há dados:

```javascript
// No console, verifique se há dados na tabela
console.log('Dados da tabela:', window.notasData || 'Não encontrado');
```

### 6. **Solução Alternativa - Proxy CORS**

Se o problema for CORS, use um proxy:

```javascript
// Modifique a URL para usar um proxy CORS
const webhookUrl = 'https://cors-anywhere.herokuapp.com/https://dadosbi.monkeybranch.com.br/webhook/3af7dec8-78d6-4858-aaff-a9669f2129a0';
```

## 🔍 Diagnóstico Detalhado

### **Logs Esperados no Console**

Ao clicar "Exportar Webhook", você deve ver:

```
=== INICIANDO EXPORTAÇÃO PARA WEBHOOK ===
URL: https://dadosbi.monkeybranch.com.br/webhook/3af7dec8-78d6-4858-aaff-a9669f2129a0
Total de registros: X
Primeiro registro: {...}
Dados preparados para envio: {...}
Tamanho dos dados (JSON): X caracteres
Fazendo requisição POST para o webhook...
Resposta recebida do webhook:
- Status: 200
- Status Text: OK
- Headers: {...}
Resposta JSON processada com sucesso: {...}
=== EXPORTAÇÃO CONCLUÍDA COM SUCESSO ===
```

### **Se Não Vir Logs**

1. **Verifique se a função está sendo chamada:**
   - Adicione `console.log('Botão clicado!');` no início de `handleWebhookExport`

2. **Verifique se o botão está renderizado:**
   - Inspecione o elemento no DevTools
   - Verifique se não há erros de JavaScript

3. **Verifique se há dados:**
   - `console.log('filteredData:', filteredData);`

## 🛠️ Correções Implementadas

### **1. Melhor Tratamento de Estado**
- Uso de `useState` para controlar loading
- Prevenção de múltiplos cliques
- Indicador visual de carregamento

### **2. Logs Detalhados**
- Logs em cada etapa do processo
- Informações sobre dados e resposta
- Tratamento de erros específicos

### **3. Timeout de Segurança**
- 30 segundos de timeout
- AbortController para cancelar requisições
- Prevenção de requisições pendentes

### **4. Validação de Dados**
- Verificação se há dados para enviar
- Validação da URL do webhook
- Tratamento de dados vazios

## 📞 Próximos Passos

1. **Teste o arquivo `test-webhook-simple.html`**
2. **Verifique o console do navegador**
3. **Execute o teste manual no console**
4. **Identifique o erro específico**
5. **Aplique a solução correspondente**

## 🚨 Se Nada Funcionar

1. **Verifique se o servidor webhook está ativo:**
   ```bash
   curl -X POST https://dadosbi.monkeybranch.com.br/webhook/3af7dec8-78d6-4858-aaff-a9669f2129a0 \
     -H "Content-Type: application/json" \
     -d '{"teste": "dados"}'
   ```

2. **Teste com Postman ou Insomnia**

3. **Verifique logs do servidor webhook**

4. **Entre em contato com o administrador do webhook**
