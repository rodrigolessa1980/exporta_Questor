# Grid Editável de Mapeamento CFOP

## Visão Geral

Foi implementado um grid editável para a planilha de mapeamento CFOP na página de Configurações. Este grid permite que os usuários adicionem, editem e excluam linhas das colunas CFOP, DESCRIÇÃO CFOP, TABELA CONTÁBIL e CONTA CONTÁBIL.

## Funcionalidades Implementadas

### 1. **Adicionar Nova Linha**
- Botão "Adicionar Linha" no topo do grid
- Formulário inline com campos para todas as colunas
- Validação para garantir que todos os campos sejam preenchidos
- Botões de confirmação (✓) e cancelamento (✗)

### 2. **Editar Linha Existente**
- Botão de edição (✏️) em cada linha
- Campos se transformam em inputs editáveis
- Botões de salvar (✓) e cancelar (✗) durante a edição
- Preserva os dados originais se cancelar

### 3. **Excluir Linha**
- Botão de exclusão (🗑️) em cada linha
- Remove a linha imediatamente do grid
- Confirmação visual através da remoção da linha

### 4. **Interface Visual**
- Cores diferenciadas para CFOPs dentro (azul) e fora (roxo) do estado
- Destaque visual para campos CFOP, Tabela CTB e Conta Contábil
- Hover effects nas linhas da tabela
- Layout responsivo e organizado

## Estrutura do Componente

### Arquivo: `src/components/CfopMappingGrid.jsx`

```jsx
const CfopMappingGrid = ({ data, onDataChange }) => {
  // Estados internos para controle de edição
  const [editingRow, setEditingRow] = useState(null);
  const [newRow, setNewRow] = useState({...});
  const [isAdding, setIsAdding] = useState(false);
  
  // Funções de manipulação
  const handleEdit = (index) => { ... };
  const handleSave = (index) => { ... };
  const handleDelete = (index) => { ... };
  const handleAdd = () => { ... };
}
```

### Props
- `data`: Array com os dados do mapeamento CFOP
- `onDataChange`: Callback executado quando os dados são modificados

## Como Usar

### 1. **Acessar Configurações**
- Clique no botão "Configurações" no cabeçalho da aplicação

### 2. **Navegar até o Grid**
- Role para baixo até a seção "Planilha de Mapeamento CFOP"

### 3. **Adicionar Nova Linha**
- Clique em "Adicionar Linha"
- Preencha os campos:
  - **CFOP**: Código fiscal (ex: 1933023)
  - **Descrição CFOP**: Descrição do serviço
  - **Tabela Contábil**: Código da tabela (ex: 2003)
  - **Conta Contábil**: Código da conta (ex: 9949)
- Clique em ✓ para confirmar ou ✗ para cancelar

### 4. **Editar Linha Existente**
- Clique no botão ✏️ da linha desejada
- Modifique os campos necessários
- Clique em ✓ para salvar ou ✗ para cancelar

### 5. **Excluir Linha**
- Clique no botão 🗑️ da linha desejada
- A linha será removida imediatamente

### 6. **Exportar Dados**
- Use o botão "Exportar" para baixar os dados em formato Excel

## Estrutura dos Dados

Cada linha do grid contém:

```javascript
{
  cfop: "1933023",           // Código fiscal
  descricao: "Serviço...",   // Descrição do CFOP
  tabelaCtb: "2003",         // Tabela contábil
  contaContabil: "9949"      // Conta contábil
}
```

## Validações

- Todos os campos são obrigatórios para adicionar uma nova linha
- Os dados são preservados durante a sessão da aplicação
- Mudanças são refletidas imediatamente no grid

## Integração com o Sistema

O grid está integrado com:
- Sistema de exportação Excel
- Mapeamento automático de CFOP para tabelas contábeis
- Processamento de notas fiscais
- Interface de configurações do sistema

## Estilização

- Utiliza Tailwind CSS para estilização
- Componentes UI reutilizáveis (Button, Input, Table)
- Cores consistentes com o design system da aplicação
- Responsivo para diferentes tamanhos de tela

## Próximas Melhorias Possíveis

1. **Persistência de Dados**: Salvar alterações em localStorage ou backend
2. **Validação Avançada**: Verificar formato de CFOP e códigos contábeis
3. **Busca e Filtros**: Adicionar funcionalidade de busca no grid
4. **Importação**: Permitir importar dados de arquivos Excel
5. **Histórico**: Manter histórico de alterações
6. **Undo/Redo**: Funcionalidade de desfazer/refazer alterações

## Arquivos Modificados

- `src/components/CfopMappingGrid.jsx` - Novo componente
- `src/App.jsx` - Integração do grid na página de configurações

## Dependências

- React 18+
- Lucide React (ícones)
- Tailwind CSS (estilização)
- Componentes UI personalizados
