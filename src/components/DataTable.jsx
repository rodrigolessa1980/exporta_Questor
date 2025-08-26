import React, { useState, useMemo } from 'react';
import { Search, Filter, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from './ui/table';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { hasNaturezaMapping } from '../data/natureza-mapping';

const DataTable = ({ data, onExport, cfopMapping = {} }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Filtra os dados baseado no termo de busca
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter(item => 
      Object.values(item).some(value => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  // Calcula dados paginados
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, itemsPerPage]);

  // Calcula total de páginas
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Função para formatar valores monetários
  const formatCurrency = (value) => {
    if (!value || isNaN(value)) return '0,00';
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Função para formatar datas
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  // Função para obter o mapeamento CFOP
  const getCfopMapping = (cfop) => {
    if (!cfop) return { tabelaCtb: '-', contaContabil: '-' };
    
    const mapping = cfopMapping[cfop] || {};
    return {
      tabelaCtb: mapping.tabelaCtb || '-',
      contaContabil: mapping.contaContabil || '-'
    };
  };

  const handleExport = () => {
    if (onExport) {
      onExport(filteredData);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Dados das Notas Fiscais</CardTitle>
            <p className="text-sm text-muted-foreground">
              {filteredData.length} registros encontrados
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={handleExport} disabled={filteredData.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Legenda de cores */}
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
          <p className="text-sm font-medium text-gray-700 mb-2">Legenda de Status:</p>
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-100 border-l-4 border-red-500 rounded"></div>
              <span className="text-red-700 font-medium">Notas NÃO Analisadas</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-50 rounded"></div>
              <span className="text-green-700 font-medium">Notas Analisadas com Sucesso</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-100 rounded"></div>
              <span className="text-yellow-700 font-medium">Serviços Fora do Estado</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-100 rounded"></div>
              <span className="text-blue-700 font-medium">Serviços com Retenções</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-200 rounded"></div>
              <span className="text-green-700 font-medium">Despesas Médicas</span>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            💡 <strong>Dica:</strong> Passe o mouse sobre a etiqueta "Não Analisada" para mais informações
          </p>
        </div>

        {/* Barra de busca */}
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar em todos os campos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabela com scroll horizontal */}
        <div className="rounded-md border overflow-x-auto">
          <Table className="min-w-[1900px]">
            <TableHeader>
              <TableRow className="bg-green-100">
                <TableHead className="bg-green-100 text-green-900 font-bold min-w-[250px]">#NATUREZA</TableHead>
                <TableHead className="bg-green-100 text-green-900 font-bold">Data Emissão</TableHead>
                <TableHead className="bg-green-100 text-green-900 font-bold">Data Entrada</TableHead>
                <TableHead className="bg-green-100 text-green-900 font-bold">Numero Nota</TableHead>
                <TableHead className="bg-green-100 text-green-900 font-bold">Inscrição Federal</TableHead>
                <TableHead className="bg-green-100 text-green-900 font-bold">Razao Social</TableHead>
                <TableHead className="bg-green-100 text-green-900 font-bold">CFOP Natureza</TableHead>
                <TableHead className="bg-green-100 text-green-900 font-bold">Valor Principal</TableHead>
                <TableHead className="bg-green-100 text-green-900 font-bold">INSS Retid</TableHead>
                <TableHead className="bg-green-100 text-green-900 font-bold">ISS Retid</TableHead>
                <TableHead className="bg-green-100 text-green-900 font-bold">PIS Retid</TableHead>
                <TableHead className="bg-green-100 text-green-900 font-bold">Cofins Retid</TableHead>
                <TableHead className="bg-green-100 text-green-900 font-bold">CS Retid</TableHead>
                <TableHead className="bg-green-100 text-green-900 font-bold">IR Retid</TableHead>
                <TableHead className="bg-green-100 text-green-900 font-bold">Valor Liquido</TableHead>
                <TableHead className="bg-green-100 text-green-900 font-bold">TABELA CTB</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((item, index) => {
                const cfopMap = getCfopMapping(item.cfop);
                const isEvenRow = index % 2 === 0;
                const rowClass = isEvenRow ? 'bg-white' : 'bg-green-50';
                
                // Verifica se a nota foi analisada (tem tabelaCtb e cfopNatureza)
                const isNotaAnalisada = item.tabelaCtb && item.cfopNatureza;
                
                // Define cores baseadas no status de análise da nota
                let specialRowClass = '';
                
                if (!isNotaAnalisada) {
                  // Nota NÃO analisada - marca em VERMELHO
                  specialRowClass = 'bg-red-100 border-l-4 border-red-500';
                } else if (item.natureza && item.natureza.includes('fora do Estado')) {
                  // Nota analisada - serviços fora do estado em amarelo
                  specialRowClass = 'bg-yellow-100';
                } else if (item.natureza && item.natureza.includes('com retido')) {
                  // Nota analisada - serviços com retenções em azul
                  specialRowClass = 'bg-blue-100';
                } else if (item.natureza && item.natureza.includes('despesas médicas')) {
                  // Nota analisada - despesas médicas em verde
                  specialRowClass = 'bg-green-200';
                } else {
                  // Nota analisada com sucesso - fundo verde claro
                  specialRowClass = 'bg-green-50';
                }
                
                // Combina as classes de cores
                const finalRowClass = specialRowClass;
                
                return (
                  <TableRow key={index} className={`hover:bg-yellow-100 ${finalRowClass}`}>
                    <TableCell className="font-medium text-sm min-w-[250px]">
                      <div className="flex items-start space-x-2">
                        <span 
                          className="flex-1 min-w-0 truncate leading-tight" 
                          title={item.natureza || '-'}
                        >
                          {item.natureza || '-'}
                        </span>
                        {!isNotaAnalisada && (
                          <Badge 
                            variant="destructive" 
                            className="text-xs whitespace-nowrap flex-shrink-0 bg-red-600 hover:bg-red-700 px-2 py-1"
                            title="Esta nota não foi analisada automaticamente"
                          >
                            Não Analisada
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(item.dataEmissao)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(item.dataEntrada)}
                    </TableCell>
                    <TableCell className="text-sm font-mono">
                      {item.numeroNota || '-'}
                    </TableCell>
                    <TableCell className="text-sm font-mono">
                      {item.inscricaoFederal || '-'}
                    </TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate" title={item.razaoSocial}>
                      {item.razaoSocial || '-'}
                    </TableCell>
                    <TableCell className="text-sm font-mono">
                      <div className="flex items-center space-x-2">
                        <span>{item.cfopNatureza || item.cfop || '-'}</span>
                        {item.natureza && hasNaturezaMapping(item.natureza) && (
                          <CheckCircle className="h-4 w-4 text-green-600" title="CFOP preenchido automaticamente pela natureza" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-mono text-right">
                      {formatCurrency(item.valorPrincipal)}
                    </TableCell>
                    <TableCell className="text-sm font-mono text-right">
                      {formatCurrency(item.inssRetid || 0)}
                    </TableCell>
                    <TableCell className="text-sm font-mono text-right">
                      {formatCurrency(item.issRetid || 0)}
                    </TableCell>
                    <TableCell className="text-sm font-mono text-right">
                      {formatCurrency(item.pisRetid || 0)}
                    </TableCell>
                    <TableCell className="text-sm font-mono text-right">
                      {formatCurrency(item.cofinsRetid || 0)}
                    </TableCell>
                    <TableCell className="text-sm font-mono text-right">
                      {formatCurrency(item.csRetid || 0)}
                    </TableCell>
                    <TableCell className="text-sm font-mono text-right">
                      {formatCurrency(item.irRetid || 0)}
                    </TableCell>
                    <TableCell className="text-sm font-mono text-right font-bold">
                      {formatCurrency(item.valorLiquido)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {item.tabelaCtb || cfopMap.tabelaCtb || '-'}
                        </Badge>
                        {item.natureza && hasNaturezaMapping(item.natureza) && item.tabelaCtb && (
                          <CheckCircle className="h-4 w-4 text-green-600" title="TABELA CTB preenchida automaticamente pela natureza" />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataTable;
