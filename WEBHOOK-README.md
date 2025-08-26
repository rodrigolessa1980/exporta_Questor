# 🌐 Funcionalidade de Webhook - Sistema de Notas Fiscais

## 📋 Visão Geral

Foi implementada uma nova funcionalidade que permite exportar os dados das notas fiscais diretamente para um webhook externo, além da exportação tradicional para Excel.

## 🚀 Como Usar

### 1. **Botão "Exportar Webhook"**
- Aparece na tabela de dados processados
- Localizado ao lado do botão "Exportar Excel"
- Estilo verde com ícone de globo

### 2. **URL do Webhook**
```
https://dadosbi.monkeybranch.com.br/webhook/3af7dec8-78d6-4858-aaff-a9669f2129a0
```

### 3. **Formato dos Dados Enviados**
```json
{
  "timestamp": "2024-12-17T10:30:00.000Z",
  "totalRegistros": 150,
  "dados": [
    {
      "natureza": "Serviço administrativos com retido - dentro do estado",
      "dataEmissao": "15/12/2024",
      "dataEntrada": "15/12/2024",
      "numeroNota": "001",
      "inscricaoFederal": "12.345.678/0001-90",
      "razaoSocial": "Empresa Teste LTDA",
      "cfopNatureza": "1933023",
      "valorPrincipal": 1000.00,
      "inssRetid": 110.00,
      "issRetid": 50.00,
      "pisRetid": 6.50,
      "cofinsRetid": 30.00,
      "csRetid": 0.00,
      "irRetid": 150.00,
      "valorLiquido": 653.50,
      "tabelaCtb": "2003"
    }
  ]
}
```

## 🔧 Implementação Técnica

### Arquivos Modificados
1. **`src/services/fileProcessor.js`**
   - Nova função `exportToWebhook()`
   - Tratamento de erros robusto
   - Logs detalhados para debug

2. **`src/components/DataTable.jsx`**
   - Botão "Exportar Webhook"
   - Indicador de carregamento
   - Tratamento de erros amigável

3. **`src/App.jsx`**
   - Import da nova função

### Função Principal
```javascript
export const exportToWebhook = async (data, webhookUrl) => {
  // Prepara dados
  // Faz requisição POST
  // Trata resposta
  // Retorna resultado
}
```

## 🧪 Teste da Funcionalidade

### Arquivo de Teste
- **`test-webhook.html`** - Página HTML independente para testar o webhook
- Inclui dados de exemplo
- Mostra status detalhado das requisições
- Útil para debug e validação

### Como Testar
1. Abra `test-webhook.html` no navegador
2. Clique em "🚀 Testar Webhook"
3. Verifique o console para logs detalhados
4. Analise a resposta do servidor

## ⚠️ Considerações Importantes

### CORS (Cross-Origin Resource Sharing)
- A função usa `mode: 'cors'` explicitamente
- Pode haver restrições dependendo da configuração do servidor
- Em caso de erro CORS, verifique as configurações do webhook

### Tratamento de Erros
- **Erro de Conexão**: Verifica conectividade e acessibilidade
- **Erro CORS**: Indica problemas de permissão de domínio
- **Erro HTTP**: Mostra detalhes da resposta do servidor
- **Erro de Parse**: Lida com respostas não-JSON

### Logs e Debug
- Console do navegador mostra detalhes completos
- Inclui dados enviados e respostas recebidas
- Útil para troubleshooting

## 🔍 Solução de Problemas

### Erro: "Falha na conexão com o webhook"
- ✅ Verifique conectividade com a internet
- ✅ Confirme se a URL está correta
- ✅ Teste a acessibilidade do webhook

### Erro: "Erro de CORS"
- ✅ O servidor deve permitir requisições do domínio
- ✅ Verifique headers de resposta do webhook
- ✅ Considere usar um proxy se necessário

### Erro: "Erro HTTP: 404/500/etc"
- ✅ Verifique se o endpoint está ativo
- ✅ Confirme se o formato dos dados está correto
- ✅ Verifique logs do servidor webhook

## 📊 Monitoramento

### Indicadores Visuais
- **Botão desabilitado** durante envio
- **Spinner de carregamento** com texto "Enviando..."
- **Mensagens de sucesso/erro** detalhadas
- **Logs no console** para debug

### Métricas
- Total de registros enviados
- Timestamp de cada envio
- Status da resposta do servidor
- Tempo de resposta

## 🚀 Próximos Passos

### Melhorias Sugeridas
1. **Configuração de Webhook**
   - Permitir múltiplos webhooks
   - Interface para configurar URLs
   - Validação de URLs

2. **Retry Automático**
   - Tentativas automáticas em caso de falha
   - Backoff exponencial
   - Fila de requisições

3. **Webhook Status**
   - Histórico de envios
   - Status de cada webhook
   - Notificações de falha

4. **Segurança**
   - Autenticação via token
   - Criptografia de dados sensíveis
   - Validação de origem

## 📞 Suporte

Para dúvidas ou problemas com a funcionalidade de webhook:
1. Verifique os logs no console do navegador
2. Use o arquivo `test-webhook.html` para testes isolados
3. Confirme se o webhook está acessível e configurado corretamente
4. Verifique se não há problemas de CORS ou conectividade
