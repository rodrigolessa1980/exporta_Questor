# Correções no Mapeamento de CFOPs - Sistema Questor

## Problema Identificado
O sistema estava aplicando CFOPs incorretos para alguns tipos de serviços, especificamente:
- **"Serviço administrativos com retido - dentro do estado"** estava recebendo CFOP "1933031" em vez de "1933023"
- **"Serviço despesas médicas com retido - dentro do estado"** não tinha mapeamento específico

## Correções Implementadas

### 1. Atualização do Mapeamento de Natureza
- **Serviço administrativos com retido - dentro do estado**: CFOP corrigido de "1933031" para "1933023", TABELA CTB "2003"
- **Serviço despesas médicas com retido - dentro do estado**: Adicionado CFOP "1933023", TABELA CTB "2003"

### 2. Melhoria na Lógica de Busca
- Priorização de busca exata por natureza
- Busca por palavras-chave específicas antes de busca parcial
- Garantia de que o mapeamento correto seja sempre aplicado

### 3. Priorização do Mapeamento de Natureza
- O mapeamento baseado na coluna #NATUREZA tem prioridade sobre o mapeamento CFOP
- Garantia de que valores corretos não sejam sobrescritos por mapeamentos genéricos

## Como Funciona Agora

### Processo de Mapeamento
1. **Leitura da Natureza**: Sistema lê a coluna "#NATUREZA" do arquivo
2. **Busca Exata**: Procura por correspondência exata no mapeamento
3. **Busca por Palavras-chave**: Se não encontrar, busca por palavras-chave específicas
4. **Aplicação do Mapeamento**: Aplica CFOP e TABELA CTB corretos
5. **Priorização**: Mapeamento de natureza tem prioridade sobre mapeamento CFOP

### Exemplo de Funcionamento
```
Natureza: "Serviço despesas médicas com retido - dentro do estado"
↓
Sistema consulta tabela de mapeamento
↓
Encontra: CFOP "1933023", TABELA CTB "2003"
↓
Aplica automaticamente nas colunas correspondentes
```

## Arquivos Modificados
- `src/data/natureza-mapping.js` - Mapeamentos corrigidos e lógica de busca melhorada
- `src/services/fileProcessor.js` - Priorização do mapeamento de natureza
- `src/App.jsx` - Lógica de processamento atualizada

## Benefícios das Correções
- ✅ CFOPs sempre corretos baseados na natureza do serviço
- ✅ Consulta automática da tabela de mapeamento
- ✅ Priorização de mapeamentos específicos sobre genéricos
- ✅ Redução de erros manuais na classificação
- ✅ Consistência nos dados exportados

## Teste das Correções
Para verificar se as correções funcionam:
1. Importe um arquivo com "Serviço despesas médicas com retido - dentro do estado"
2. Verifique se o CFOP "1933023" e TABELA CTB "2003" são aplicados automaticamente
3. Confirme que outros serviços também recebem os mapeamentos corretos
