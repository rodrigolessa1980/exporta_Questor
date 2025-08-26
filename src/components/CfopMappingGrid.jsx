import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from './ui/table';

const CfopMappingGrid = ({ data, onDataChange }) => {
  const [editingRow, setEditingRow] = useState(null);
  const [newRow, setNewRow] = useState({ cfop: '', descricao: '', tabelaCtb: '', contaContabil: '' });
  const [isAdding, setIsAdding] = useState(false);

  const handleEdit = (index) => {
    setEditingRow(index);
  };

  const handleSave = (index) => {
    setEditingRow(null);
    if (onDataChange) {
      onDataChange([...data]);
    }
  };

  const handleCancel = () => {
    setEditingRow(null);
    setIsAdding(false);
    setNewRow({ cfop: '', descricao: '', tabelaCtb: '', contaContabil: '' });
  };

  const handleDelete = (index) => {
    const newData = data.filter((_, i) => i !== index);
    if (onDataChange) {
      onDataChange(newData);
    }
  };

  const handleAdd = () => {
    if (newRow.cfop && newRow.descricao && newRow.tabelaCtb && newRow.contaContabil) {
      const newData = [...data, { ...newRow }];
      if (onDataChange) {
        onDataChange(newData);
      }
      setNewRow({ cfop: '', descricao: '', tabelaCtb: '', contaContabil: '' });
      setIsAdding(false);
    }
  };

  const handleInputChange = (index, field, value) => {
    if (index === 'new') {
      setNewRow(prev => ({ ...prev, [field]: value }));
    } else {
      data[index][field] = value;
    }
  };

  const renderCell = (item, index, field) => {
    if (editingRow === index) {
      return (
        <Input
          value={item[field]}
          onChange={(e) => handleInputChange(index, field, e.target.value)}
          className="w-full text-sm"
          placeholder={field === 'cfop' ? 'Ex: 1933023' : field === 'descricao' ? 'Descrição do CFOP' : field === 'tabelaCtb' ? 'Ex: 2003' : 'Ex: 9949'}
        />
      );
    }
    
    if (field === 'cfop') {
      return <span className="font-mono text-sm bg-green-50 px-2 py-1 rounded">{item[field]}</span>;
    } else if (field === 'tabelaCtb') {
      return <span className="font-mono text-sm bg-green-50 px-2 py-1 rounded">{item[field]}</span>;
    } else if (field === 'contaContabil') {
      return <span className="font-mono text-sm bg-yellow-50 px-2 py-1 rounded">{item[field]}</span>;
    } else {
      return (
        <span className={item.cfop.startsWith('1') ? 'text-blue-600' : 'text-purple-600'}>
          {item[field]}
        </span>
      );
    }
  };

  const renderActions = (index) => {
    if (editingRow === index) {
      return (
        <div className="flex space-x-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleSave(index)}
            className="h-8 w-8 p-0"
          >
            <Check className="h-4 w-4 text-green-600" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      );
    }

    return (
      <div className="flex space-x-1">
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleEdit(index)}
          className="h-8 w-8 p-0"
        >
          <Edit2 className="h-4 w-4 text-blue-600" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleDelete(index)}
          className="h-8 w-8 p-0"
        >
          <Trash2 className="h-4 w-4 text-red-600" />
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Botão Adicionar Nova Linha */}
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium text-gray-700">Mapeamento CFOP → Tabela Contábil</h4>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsAdding(true)}
          className="flex items-center space-x-2"
          disabled={isAdding}
        >
          <Plus className="h-4 w-4" />
          <span>Adicionar Linha</span>
        </Button>
      </div>

      {/* Linha de Adição */}
      {isAdding && (
        <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 bg-blue-50">
          <div className="grid grid-cols-5 gap-2 items-center">
            <Input
              value={newRow.cfop}
              onChange={(e) => handleInputChange('new', 'cfop', e.target.value)}
              placeholder="CFOP"
              className="text-sm"
            />
            <Input
              value={newRow.descricao}
              onChange={(e) => handleInputChange('new', 'descricao', e.target.value)}
              placeholder="Descrição CFOP"
              className="text-sm"
            />
            <Input
              value={newRow.tabelaCtb}
              onChange={(e) => handleInputChange('new', 'tabelaCtb', e.target.value)}
              placeholder="Tabela CTB"
              className="text-sm"
            />
            <Input
              value={newRow.contaContabil}
              onChange={(e) => handleInputChange('new', 'contaContabil', e.target.value)}
              placeholder="Conta Contábil"
              className="text-sm"
            />
            <div className="flex space-x-1">
              <Button
                size="sm"
                onClick={handleAdd}
                className="h-8 px-3"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                className="h-8 px-3"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tabela de Dados */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-green-50">
              <TableHead className="bg-green-100 text-green-900 font-semibold text-center">CFOP</TableHead>
              <TableHead className="bg-green-800 text-white font-semibold">DESCRIÇÃO CFOP</TableHead>
              <TableHead className="bg-green-800 text-white font-semibold text-center">TABELA CONTÁBIL</TableHead>
              <TableHead className="bg-yellow-500 text-white font-semibold text-center">CONTA CONTÁBIL</TableHead>
              <TableHead className="bg-gray-100 text-gray-900 font-semibold text-center">AÇÕES</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={index} className="hover:bg-gray-50">
                <TableCell className="text-center">
                  {renderCell(item, index, 'cfop')}
                </TableCell>
                <TableCell>
                  {renderCell(item, index, 'descricao')}
                </TableCell>
                <TableCell className="text-center">
                  {renderCell(item, index, 'tabelaCtb')}
                </TableCell>
                <TableCell className="text-center">
                  {renderCell(item, index, 'contaContabil')}
                </TableCell>
                <TableCell className="text-center">
                  {renderActions(index)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Legenda */}
      <div className="text-sm text-gray-600">
        <p><strong>Legenda:</strong></p>
        <div className="flex items-center space-x-4 mt-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Dentro do estado (CFOP 1xxx)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>Fora do estado (CFOP 2xxx)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CfopMappingGrid;
