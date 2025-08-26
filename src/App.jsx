import React, { useState, useCallback } from 'react';
import { FileText, Settings, AlertCircle, CheckCircle, Database, X, Download, Play } from 'lucide-react';
import FileUploadComponent from './components/FileUpload';
import DataTable from './components/DataTable';
import CfopMappingGrid from './components/CfopMappingGrid';
import { processExcelFile, processXmlFile, processCfopMappingFile, exportToExcel } from './services/fileProcessor';
import { Button } from './components/ui/button';
import { getAllNaturezaMappings, hasNaturezaMapping, findNaturezaMapping } from './data/natureza-mapping';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableCaption } from './components/ui/table';

function App() {
  const [notasData, setNotasData] = useState([]);
  const [cfopMapping, setCfopMapping] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [rawData, setRawData] = useState([]); // Dados brutos antes do processamento

  // Dados de exemplo da planilha de mapeamento CFOP
  const [cfopMappingData, setCfopMappingData] = useState([
    { cfop: '1933023', descricao: 'Serviço administrativos com retido - dentro do estado', tabelaCtb: '2003', contaContabil: '9949' },
    { cfop: '2933023', descricao: 'Serviço administrativos com retido - fora do Estado', tabelaCtb: '2003', contaContabil: '9949' },
    { cfop: '1933026', descricao: 'Serviço despesas médicas com retido - dentro do estado', tabelaCtb: '2006', contaContabil: '3430' },
    { cfop: '2933026', descricao: 'Serviço despesas médicas com retido - fora do Estado', tabelaCtb: '2006', contaContabil: '3430' },
    { cfop: '1933028', descricao: 'Serviço software com retido - dentro do estado', tabelaCtb: '2008', contaContabil: '3206' },
    { cfop: '2933028', descricao: 'Serviço software com retido - fora do Estado', tabelaCtb: '2008', contaContabil: '3206' },
    { cfop: '1933029', descricao: 'Serviço honorários advocatícios com retido - dentro do estado', tabelaCtb: '2010', contaContabil: '3271' },
    { cfop: '2933029', descricao: 'Serviço honorários advocatícios com retido - fora do Estado', tabelaCtb: '2010', contaContabil: '3271' },
    { cfop: '1933030', descricao: 'Serviço segurança e vigilância com retido - dentro do estado', tabelaCtb: '2012', contaContabil: '3208' },
    { cfop: '2933030', descricao: 'Serviço segurança e vigilância com retido - fora do Estado', tabelaCtb: '2012', contaContabil: '3208' },
    { cfop: '1933031', descricao: 'Serviço limpeza e conservação com retido - dentro do estado', tabelaCtb: '2017', contaContabil: '3193' },
    { cfop: '2933031', descricao: 'Serviço limpeza e conservação com retido - fora do Estado', tabelaCtb: '2017', contaContabil: '3193' },
    { cfop: '1933032', descricao: 'Serviço não especificados anteriormente com retido - dentro do estado', tabelaCtb: '2027', contaContabil: '3142' },
    { cfop: '2933032', descricao: 'Serviço não especificados anteriormente com retido - fora do Estado', tabelaCtb: '2027', contaContabil: '3142' },
  ]);

  // Função para lidar com mudanças no mapeamento CFOP
  const handleCfopMappingChange = useCallback((newData) => {
    setCfopMappingData(newData);
  }, []);

  // Função para processar arquivos selecionados
  const handleFilesSelected = useCallback(async (files) => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    
    try {
      let allData = [];
      let newCfopMapping = { ...cfopMapping };
      
      for (const file of files) {
        const extension = file.name.toLowerCase().split('.').pop();
        
        if (extension === 'xml') {
          const xmlData = await processXmlFile(file);
          allData = [...allData, ...xmlData];
        } else if (['xlsx', 'xls'].includes(extension)) {
          // Verifica se é arquivo de mapeamento CFOP (segunda planilha)
          try {
            const cfopData = await processCfopMappingFile(file);
            newCfopMapping = { ...newCfopMapping, ...cfopData };
            setSuccess(`Mapeamento CFOP atualizado com ${Object.keys(cfopData).length} registros`);
          } catch (cfopError) {
            // Se não for arquivo de mapeamento, processa como dados de notas
            const excelData = await processExcelFile(file);
            allData = [...allData, ...excelData];
          }
        }
      }
      
      // Armazena dados brutos para processamento posterior
      setRawData(allData);
      setCfopMapping(newCfopMapping);
      
      if (allData.length > 0) {
        setSuccess(`${allData.length} arquivos carregados. Clique em "Processar notas" para analisar os dados.`);
      }
      
    } catch (error) {
      setError(`Erro ao carregar arquivos: ${error.message}`);
      console.error('Erro:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [cfopMapping]);

  // Nova função para processar notas
  const handleProcessNotas = useCallback(async () => {
    if (rawData.length === 0) {
      setError('Nenhum dado para processar. Carregue arquivos primeiro.');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Aplica o mapeamento CFOP aos dados
      const processedData = rawData.map(item => {
        // Prioriza o mapeamento de natureza (mais específico)
        let finalTabelaCtb = item.tabelaCtb || '';
        let finalContaContabil = '';
        
        // Se tem mapeamento de natureza, usa ele
        if (item.natureza && item.cfopNatureza) {
          const naturezaMapping = findNaturezaMapping(item.natureza);
          if (naturezaMapping) {
            finalTabelaCtb = naturezaMapping.tabelaCtb || finalTabelaCtb;
          }
        }
        
        // Aplica mapeamento CFOP como complemento
        const cfopMap = cfopMapping[item.cfop] || cfopMapping[item.cfopNatureza] || {};
        if (cfopMap.tabelaCtb && !finalTabelaCtb) {
          finalTabelaCtb = cfopMap.tabelaCtb;
        }
        finalContaContabil = cfopMap.contaContabil || '';
        
        return {
          ...item,
          tabelaCtb: finalTabelaCtb,
          contaContabil: finalContaContabil
        };
      });
      
      setNotasData(processedData);
      setSuccess(`${processedData.length} notas fiscais processadas e analisadas com sucesso!`);
      
    } catch (error) {
      setError(`Erro ao processar notas: ${error.message}`);
      console.error('Erro:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [rawData, cfopMapping]);


  // Função para exportar dados
  const handleExport = useCallback((data) => {
    try {
      const filename = `notas_fiscais_exportadas_${new Date().toISOString().split('T')[0]}.xlsx`;
      exportToExcel(data, filename);
      setSuccess(`Arquivo exportado com sucesso: ${filename}`);
    } catch (error) {
      setError(`Erro ao exportar: ${error.message}`);
    }
  }, []);

  // Função para limpar dados
  const handleClearData = useCallback(() => {
    // Confirmação antes de limpar todos os dados
    if (window.confirm('Tem certeza que deseja limpar TODOS os dados? Isso inclui:\n\n• Dados das notas fiscais\n• Dados brutos carregados\n• Mapeamento CFOP (anexos)\n• Mensagens de erro/sucesso\n\nEsta ação não pode ser desfeita.')) {
      // Limpa todos os estados de dados
      setNotasData([]);
      setRawData([]);
      setCfopMapping({});
      setError(null);
      setSuccess(null);
      
      // Mensagem de confirmação
      setSuccess('Todos os dados foram limpos com sucesso, incluindo:\n\n• Notas para Análise\n• Notas NÃO Analisadas\n• Notas Analisadas\n• Mapeamentos CFOP\n• Dados processados');
      
      // Remove a mensagem após 4 segundos
      setTimeout(() => {
        setSuccess(null);
      }, 4000);
    }
  }, []);

  // Função para abrir/fechar modal de configurações
  const toggleConfigModal = useCallback(() => {
    setShowConfigModal(!showConfigModal);
  }, [showConfigModal]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Sistema de Notas Fiscais - Questor
                </h1>
                <p className="text-sm text-muted-foreground">
                  Importação, análise e exportação de notas fiscais
                </p>
              </div>
            </div>
            
            {/* Botão de Configuração */}
            <Button
              onClick={toggleConfigModal}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>Configurações</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Modal de Configurações */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Configurações do Sistema</h2>
              <button
                onClick={toggleConfigModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Configurações de Processamento */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Configurações de Processamento</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <p className="font-medium text-gray-900">Mapeamento Automático de Natureza</p>
                      <p className="text-sm text-gray-600">Ativa o preenchimento automático baseado na coluna #NATUREZA</p>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-green-600 font-medium">Ativo</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <p className="font-medium text-gray-900">Mapeamento CFOP → CTB</p>
                      <p className="text-sm text-gray-600">Permite importar planilha de mapeamento CFOP para TABELA CTB</p>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-green-600 font-medium">Ativo</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informações do Sistema */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Informações do Sistema</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded-md">
                    <p className="text-sm font-medium text-blue-800">Total de Naturezas Mapeadas</p>
                    <p className="text-xl font-bold text-blue-900">
                      {Object.keys(getAllNaturezaMappings()).length}
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-md">
                    <p className="text-sm font-medium text-green-800">CFOPs Mapeados</p>
                    <p className="text-xl font-bold text-green-900">
                      {Object.keys(cfopMapping).length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Configurações de Exportação */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Configurações de Exportação</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <p className="font-medium text-gray-900">Formato de Data</p>
                      <p className="text-sm text-gray-600">Formato padrão para exportação de datas</p>
                    </div>
                    <span className="text-sm text-gray-600">DD/MM/AAAA</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <p className="font-medium text-gray-900">Nome do Arquivo</p>
                      <p className="text-sm text-gray-600">Padrão para nome dos arquivos exportados</p>
                    </div>
                    <span className="text-sm text-gray-600">notas_fiscais_exportadas_YYYY-MM-DD.xlsx</span>
                  </div>
                </div>
              </div>

              {/* Planilha de Mapeamento CFOP */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-gray-900">Planilha de Mapeamento CFOP</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                    onClick={() => {
                      const filename = `mapeamento_cfop_${new Date().toISOString().split('T')[0]}.xlsx`;
                      exportToExcel(cfopMappingData, filename);
                    }}
                  >
                    <Download className="h-4 w-4" />
                    <span>Exportar</span>
                  </Button>
                </div>
                
                <CfopMappingGrid 
                  data={cfopMappingData} 
                  onDataChange={handleCfopMappingChange}
                />
              </div>

              {/* Ações */}
              <div className="flex space-x-3 pt-4 border-t">
                <Button
                  onClick={handleClearData}
                  variant="outline"
                  className="flex-1"
                >
                  Limpar Todos os Dados + Anexos
                </Button>
                <Button
                  onClick={toggleConfigModal}
                  className="flex-1"
                >
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Upload Section */}
          <section>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Importação de Arquivos</h2>
              </div>
              
              <FileUploadComponent onFilesSelected={handleFilesSelected} />

              {/* Status das Notas */}
              {rawData.length > 0 && notasData.length === 0 && (
                <div className="text-center">
                  <p className="text-sm text-amber-600 mt-2">
                    ⚠️ Clique em "Processar notas" para analisar os dados carregados
                  </p>
                </div>
              )}

              {/* Botão Processar Notas */}
              {rawData.length > 0 && (
                <div className="mt-4">
                  <Button
                    onClick={handleProcessNotas}
                    disabled={isProcessing}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-md transition-colors"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    {isProcessing ? 'Processando...' : `Processar ${rawData.length} Notas`}
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2 text-center">
                    Clique para analisar e aplicar mapeamentos automáticos nas notas carregadas
                  </p>
                </div>
              )}

              {/* Status de processamento */}
              {isProcessing && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-blue-800">Processando arquivos...</span>
                  </div>
                </div>
              )}

              {/* Mensagens de sucesso/erro */}
              {success && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-green-800 whitespace-pre-line">{success}</div>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-red-800">{error}</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Mapeamento de Natureza Section */}
          <section>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Database className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-foreground">Mapeamento Automático de Natureza</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
                  <p className="text-sm font-medium text-blue-800">Notas para Analise</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {rawData.length}
                  </p>
                </div>
                <div className="p-4 bg-red-50 rounded-md border border-red-200">
                  <p className="text-sm font-medium text-red-800">Notas NÃO Analisadas</p>
                  <p className="text-2xl font-bold text-red-900">
                    {rawData.length > 0 ? rawData.filter(item => !item.tabelaCtb || !item.cfopNatureza).length : 0}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-md border border-purple-200">
                  <p className="text-sm font-medium text-purple-800">Notas Analisadas</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {rawData.length > 0 ? rawData.filter(item => item.tabelaCtb && item.cfopNatureza).length : 0}
                  </p>
                </div>
              </div>
              
              {/* Mensagem quando não há dados */}
              {rawData.length === 0 && (
                <div className="text-center py-6 bg-gray-50 border border-gray-200 rounded-md">
                  <Database className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Nenhuma nota carregada</p>
                  <p className="text-sm text-gray-400 mt-1">Use a seção de importação acima para carregar arquivos</p>
                </div>
              )}
              
              <div className="text-sm text-muted-foreground">
                {rawData.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500 italic">Nenhuma nota carregada. Use a seção de importação acima para carregar arquivos.</p>
                  </div>
                ) : (
                  <>
                    <p className="mb-2">
                      <strong>Notas para Análise:</strong> Quantidade total de notas carregadas nos arquivos selecionados.
                    </p>
                    <p className="mb-2">
                      <strong>Notas NÃO Analisadas:</strong> Notas que não foram totalmente preenchidas (marcadas em <span className="text-red-600 font-medium">VERMELHO</span> na tabela).
                    </p>
                    <p>
                      <strong>Notas Analisadas:</strong> Notas processadas e analisadas com sucesso (marcadas em <span className="text-green-600 font-medium">VERDE</span> na tabela).
                    </p>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Mapeamento CFOP Section */}
          {Object.keys(cfopMapping).length > 0 && (
            <section>
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Settings className="h-5 w-5 text-purple-600" />
                  <h2 className="text-xl font-semibold text-foreground">Mapeamento CFOP</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
                    <p className="text-sm font-medium text-blue-800">Total de CFOPs</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {Object.keys(cfopMapping).length}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-md border border-green-200">
                    <p className="text-sm font-medium text-green-800">Com Tabela CTB</p>
                    <p className="text-2xl font-bold text-green-900">
                      {Object.values(cfopMapping).filter(m => m.tabelaCtb).length}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-md border border-purple-200">
                    <p className="text-sm font-medium text-purple-800">Com Conta Contábil</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {Object.values(cfopMapping).filter(m => m.contaContabil).length}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Data Table Section */}
          {notasData.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">Dados Processados</h2>
                <button
                  onClick={handleClearData}
                  className="px-4 py-2 text-sm font-medium text-secondary-foreground bg-secondary border border-input rounded-md hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
                >
                  Limpar Dados
                </button>
              </div>
              <DataTable 
                data={notasData} 
                onExport={handleExport}
                cfopMapping={cfopMapping}
              />
            </section>
          )}

          {/* Instructions */}
          {notasData.length === 0 && (
            <section>
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Como usar o sistema</h2>
                <div className="space-y-4 text-sm text-muted-foreground">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div>
                    <h3 className="font-medium text-foreground mb-2">1. Importar Arquivos</h3>
                    <ul className="space-y-1 ml-4">
                      <li>• Arraste e solte arquivos XML (NFe/NFSe) ou Excel</li>
                      <li>• Suporte a múltiplos arquivos simultâneos</li>
                      <li>• Formatos aceitos: .xml (NFe/NFSe), .xlsx, .xls</li>
                      <li>• Após carregar, clique em "Processar notas" para análise</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-2">2. Processar e Analisar</h3>
                    <ul className="space-y-1 ml-4">
                      <li>• <strong>Botão "Processar notas":</strong> Analisa todas as notas carregadas</li>
                      <li>• <strong>Natureza → CFOP/CTB:</strong> Preenchimento automático baseado na coluna #NATUREZA</li>
                      <li>• <strong>CFOP → CTB:</strong> Aplica mapeamento CFOP → TABELA CTB</li>
                      <li>• Processamento em duas etapas: carregamento → análise</li>
                    </ul>
                  </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-2">3. Exportação</h3>
                    <ul className="space-y-1 ml-4">
                      <li>• Exporte para Excel no formato padrão</li>
                      <li>• Colunas: Natureza, Data Emissão, Entrada, Número da Nota, etc.</li>
                      <li>• Dados já mapeados com CFOP → CTB</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
