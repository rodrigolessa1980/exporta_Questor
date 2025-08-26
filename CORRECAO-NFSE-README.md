# Correção para Suporte a Arquivos NFSe

## Problema Identificado

O sistema estava apresentando o erro **"Estrutura XML inválida - não é uma NFe"** ao tentar carregar arquivos NFSe (Nota Fiscal de Serviços Eletrônica).

## Causa do Problema

O código original no `fileProcessor.js` estava validando apenas arquivos NFe (Nota Fiscal Eletrônica), procurando por elementos específicos como:
- `nfeProc`
- `NFe` 
- `infNFe`

Arquivos NFSe têm uma estrutura completamente diferente, com elementos como:
- `ConsultarNfseResposta`
- `ListaNfse`
- `CompNfse`
- `Nfse`
- `InfNfse`

## Soluções Implementadas

### 1. Detecção Automática de Tipo de Arquivo

Modificamos a função `processXmlFile` para detectar automaticamente se o arquivo é:
- **NFe**: Nota Fiscal Eletrônica
- **NFSe**: Nota Fiscal de Serviços Eletrônica

### 2. Processamento Específico para NFSe

Implementamos processamento específico para arquivos NFSe, extraindo dados dos elementos corretos:

```javascript
// Para NFSe
const natureza = getElementText(rootElement, 'NaturezaOperacao');
const cfop = getElementText(servico, 'ItemListaServico');
const valores = servico.querySelector('Valores');

// Extrai valores específicos da NFSe
valorPrincipal: parseFloat(getElementText(valores, 'ValorServicos') || '0'),
issRetid: parseFloat(getElementText(valores, 'ValorIss') || '0'),
valorLiquido: parseFloat(getElementText(valores, 'ValorLiquidoNfse') || '0')
```

### 3. Mapeamento para Código 101

Adicionamos mapeamento específico para o código de natureza "101" que aparece no arquivo NFSe:

```javascript
// Código 101 - Serviços médicos/exames (NFSe)
"101": {
  cfop: "1933025",
  tabelaCtb: "2005",
  descricao: "Serviços médicos e exames laboratoriais"
}
```

### 4. Mensagens de Erro Mais Claras

Atualizamos as mensagens de erro para especificar que o sistema suporta tanto NFe quanto NFSe:

```
"Estrutura XML inválida - arquivo deve ser uma NFe (Nota Fiscal Eletrônica) ou NFSe (Nota Fiscal de Serviços Eletrônica) válida"
```

### 5. Interface Atualizada

- Componente `FileUpload`: Atualizado para mostrar "XML (NFe/NFSe)"
- `App.jsx`: Instruções atualizadas para mencionar suporte a NFSe
- Mensagens de erro mais específicas

## Arquivos Modificados

1. **`src/services/fileProcessor.js`**
   - Função `processXmlFile` completamente reescrita
   - Detecção automática de tipo de arquivo
   - Processamento específico para NFe e NFSe

2. **`src/data/natureza-mapping.js`**
   - Adicionado mapeamento para código "101"

3. **`src/components/FileUpload.jsx`**
   - Interface atualizada para mostrar suporte a NFSe

4. **`src/App.jsx`**
   - Instruções atualizadas
   - Mensagens de erro mais claras

## Como Testar

1. **Arquivo NFSe**: `ConsultaNfse_1_2917360983118378105_OKOK.xml`
   - Deve ser carregado sem erros
   - Dados extraídos corretamente
   - Mapeamento automático aplicado

2. **Arquivo NFe**: `42250351462341000110550010000001381847786263-procNFe_ok.xml`
   - Continua funcionando normalmente
   - Processamento inalterado

## Benefícios da Correção

✅ **Suporte Universal**: Sistema agora aceita tanto NFe quanto NFSe
✅ **Detecção Automática**: Tipo de arquivo detectado automaticamente
✅ **Processamento Correto**: Dados extraídos dos elementos corretos de cada tipo
✅ **Mapeamento Automático**: Aplicação automática de CFOP e TABELA CTB
✅ **Interface Clara**: Usuário sabe que ambos os tipos são suportados
✅ **Mensagens de Erro Úteis**: Erros mais específicos e informativos

## Estruturas Suportadas

### NFe (Nota Fiscal Eletrônica)
```xml
<nfeProc>
  <NFe>
    <infNFe>
      <!-- Dados da NFe -->
    </infNFe>
  </NFe>
</nfeProc>
```

### NFSe (Nota Fiscal de Serviços Eletrônica)
```xml
<ConsultarNfseResposta>
  <ListaNfse>
    <CompNfse>
      <Nfse>
        <InfNfse>
          <!-- Dados da NFSe -->
        </InfNfse>
      </Nfse>
    </CompNfse>
  </ListaNfse>
</ConsultarNfseResposta>
```

## Próximos Passos

O sistema agora está preparado para processar arquivos NFSe corretamente. Para futuras melhorias, considere:

1. **Validação de Schema**: Implementar validação XSD para ambos os tipos
2. **Mais Tipos de Nota**: Suporte a outros tipos de documentos fiscais
3. **Logs Detalhados**: Melhor rastreamento do processamento
4. **Testes Automatizados**: Testes unitários para ambos os tipos de arquivo
