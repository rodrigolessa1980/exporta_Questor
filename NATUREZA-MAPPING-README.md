# Mapeamento Automático de Natureza → CFOP → TABELA CTB

## 📋 Visão Geral

O sistema implementa um **mapeamento automático inteligente** que consulta a coluna "#NATUREZA" e preenche automaticamente as colunas "CFOP Natureza" e "TABELA CTB" baseado em um mapeamento interno pré-configurado.

## 🎯 Funcionalidade

### O que faz:
- ✅ **Consulta automaticamente** a coluna "#NATUREZA" de cada nota fiscal
- ✅ **Preenche automaticamente** a coluna "CFOP Natureza" 
- ✅ **Preenche automaticamente** a coluna "TABELA CTB"
- ✅ **Funciona com arquivos Excel e XML**
- ✅ **Aplica tanto mapeamento de natureza quanto mapeamento CFOP**

### Benefícios:
- 🚀 **Elimina trabalho manual** de preenchimento de CFOP e TABELA CTB
- 🎯 **Reduz erros** de digitação e inconsistências
- ⚡ **Acelera o processamento** de grandes volumes de notas
- 🔄 **Padroniza** o mapeamento em toda a empresa

## 🔧 Como Funciona

### 1. Processamento Automático
```javascript
// O sistema detecta automaticamente quando uma nota tem natureza
if (item.natureza && !item.cfopNatureza) {
  const naturezaMapping = findNaturezaMapping(item.natureza);
  if (naturezaMapping) {
    item.cfopNatureza = naturezaMapping.cfop;        // Preenche CFOP
    item.tabelaCtb = naturezaMapping.tabelaCtb;     // Preenche TABELA CTB
  }
}
```

### 2. Mapeamento Inteligente
- **Busca exata**: Procura primeiro por correspondência exata da natureza
- **Busca por palavras-chave**: Se não encontrar exato, busca por termos similares
- **Fallback**: Se não encontrar, mantém os valores originais

### 3. Prioridade de Mapeamento
1. **Mapeamento de Natureza** (automático)
2. **Mapeamento CFOP** (arquivo de planilha)
3. **Valores originais** (se existirem)

## 📊 Mapeamentos Configurados

### Serviços de Consultoria e Gestão
```javascript
"Serviço de consultoria e gestão - dentro do estado": {
  cfop: "1933034",
  tabelaCtb: "2014",
  descricao: "Serviços de consultoria e gestão empresarial"
}
```

### Serviços de Software
```javascript
"Serviço software - fora do Estado": {
  cfop: "2933027",
  tabelaCtb: "2007",
  descricao: "Serviços de desenvolvimento de software"
}
```

### Serviços Advocatícios
```javascript
"Serviço honorários advocatícios - fora do Estado": {
  cfop: "2933029",
  tabelaCtb: "2009",
  descricao: "Serviços advocatícios e jurídicos"
}
```

### Serviços Médicos
```javascript
"Serviço despesas médicas - dentro do estado": {
  cfop: "1933025",
  tabelaCtb: "2005",
  descricao: "Serviços médicos e hospitalares"
}
```

## 🎨 Interface Visual

### Indicadores Visuais
- **✅ Ícone verde**: Indica que CFOP foi preenchido automaticamente pela natureza
- **✅ Ícone verde**: Indica que TABELA CTB foi preenchida automaticamente pela natureza
- **🔵 Badge azul**: Mostra a TABELA CTB (automática ou do mapeamento CFOP)

### Seção de Estatísticas
- **Total de Naturezas Mapeadas**: Quantas naturezas têm mapeamento configurado
- **Com CFOP**: Quantas têm CFOP configurado
- **Com TABELA CTB**: Quantas têm TABELA CTB configurada

## 📁 Arquivos do Sistema

### 1. Configuração de Mapeamento
```
src/data/natureza-mapping.js
```
- Contém todos os mapeamentos estáticos
- Funções de busca e validação
- Configuração centralizada

### 2. Processamento de Arquivos
```
src/services/fileProcessor.js
```
- Aplica mapeamento automático em Excel
- Aplica mapeamento automático em XML
- Integra com mapeamento CFOP

### 3. Interface Principal
```
src/App.jsx
```
- Mostra estatísticas do mapeamento
- Exibe informações sobre a funcionalidade
- Interface de usuário

### 4. Tabela de Dados
```
src/components/DataTable.jsx
```
- Exibe indicadores visuais
- Mostra quando campos foram preenchidos automaticamente
- Formatação especial para campos mapeados

## 🚀 Como Usar

### 1. Carregar Dados
- **Importar arquivos**: Arraste e solte arquivos XML ou Excel
- **Arquivos próprios**: Arraste e solte arquivos Excel ou XML

### 2. Verificar Mapeamento
- Observe a seção "Mapeamento Automático de Natureza"
- Verifique quantas naturezas estão configuradas
- Confirme que CFOP e TABELA CTB estão sendo preenchidos

### 3. Identificar Campos Automáticos
- **Ícone verde** ao lado do CFOP = preenchido automaticamente
- **Ícone verde** ao lado da TABELA CTB = preenchida automaticamente
- **Sem ícone** = valor original ou do mapeamento CFOP

### 4. Exportar Resultados
- Clique em "Exportar Excel"
- Todas as colunas estarão preenchidas (automático + manual)

## 🔧 Personalização

### Adicionar Novos Mapeamentos
```javascript
// Em src/data/natureza-mapping.js
export const NATUREZA_MAPPING = {
  // ... mapeamentos existentes ...
  
  "Novo tipo de serviço": {
    cfop: "1234567",
    tabelaCtb: "9999",
    descricao: "Descrição do novo serviço"
  }
};
```

### Modificar Mapeamentos Existentes
```javascript
"Serviço de consultoria e gestão - dentro do estado": {
  cfop: "1933034",        // Alterar CFOP se necessário
  tabelaCtb: "2014",      // Alterar TABELA CTB se necessário
  descricao: "Descrição atualizada"
}
```

### Adicionar Novas Palavras-chave
```javascript
// Na função findNaturezaMapping
if (keyLower.includes('nova_palavra') && naturezaLower.includes('nova_palavra')) {
  return mapping;
}
```

## 📈 Estatísticas e Monitoramento

### Métricas Disponíveis
- **Total de naturezas mapeadas**: 25+ tipos de serviços
- **Taxa de sucesso**: % de notas com mapeamento automático
- **Campos preenchidos**: CFOP e TABELA CTB automaticamente

### Logs e Debug
- Console do navegador mostra mapeamentos aplicados
- Erros de mapeamento são exibidos na interface
- Validação de dados em tempo real

## 🎯 Casos de Uso

### 1. Processamento em Lote
- Importe centenas de notas fiscais
- Sistema preenche automaticamente CFOP e TABELA CTB
- Reduza tempo de processamento de horas para minutos

### 2. Padronização Empresarial
- Mapeamento consistente em toda a empresa
- Elimine variações de nomenclatura
- Padrão único para contabilidade

### 3. Auditoria e Controle
- Rastreabilidade de campos preenchidos automaticamente
- Validação de mapeamentos aplicados
- Relatórios de conformidade

## 🔒 Segurança e Validação

### Validação de Dados
- Verificação de formato de CFOP
- Validação de estrutura de TABELA CTB
- Tratamento de erros e exceções

### Backup e Recuperação
- Mapeamentos são estáticos no código
- Não há risco de perda de configuração
- Versionamento via controle de código

## 📞 Suporte e Manutenção

### Atualizações
- Mapeamentos são atualizados via código
- Deploy automático com novas versões
- Histórico de mudanças documentado

### Troubleshooting
- Verificar console do navegador para erros
- Confirmar que natureza está sendo lida corretamente
- Validar formato dos dados de entrada

---

## 🎉 Resumo

O **Mapeamento Automático de Natureza** é uma funcionalidade poderosa que:

1. **Automatiza** o preenchimento de CFOP e TABELA CTB
2. **Reduz** erros manuais e tempo de processamento
3. **Padroniza** o mapeamento em toda a empresa
4. **Integra** com o sistema existente de mapeamento CFOP
5. **Fornece** indicadores visuais claros do que foi preenchido automaticamente

Esta funcionalidade torna o sistema mais eficiente, preciso e fácil de usar, especialmente para grandes volumes de notas fiscais.
