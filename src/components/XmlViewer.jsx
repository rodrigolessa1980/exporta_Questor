import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Eye, Download, Copy, CheckCircle, AlertTriangle, X } from 'lucide-react';

/**
 * Componente para visualizar XML intermediário e métricas de confiabilidade
 */
export default function XmlViewer({ xmlContent, confiabilidade, fileName, onClose }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyXml = async () => {
    try {
      await navigator.clipboard.writeText(xmlContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar XML:', error);
    }
  };

  const handleDownloadXml = () => {
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace('.pdf', '')}_intermediario.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getConfiabilityColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getConfiabilityText = (score) => {
    if (score >= 80) return 'Alta';
    if (score >= 60) return 'Média';
    return 'Baixa';
  };

  return (
    <Card className="p-4 mb-4 border-l-4 border-blue-500">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-blue-500" />
          <span className="font-medium text-sm">XML Intermediário</span>
          <Badge variant="outline" className="text-xs">
            {fileName}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            className={`text-white text-xs ${getConfiabilityColor(confiabilidade)}`}
          >
            {getConfiabilityText(confiabilidade)} ({confiabilidade}%)
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Ocultar' : 'Ver XML'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyXml}
              className="flex items-center gap-1"
            >
              {copied ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? 'Copiado!' : 'Copiar'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadXml}
              className="flex items-center gap-1"
            >
              <Download className="h-3 w-3" />
              Baixar XML
            </Button>
          </div>

          <div className="bg-gray-50 rounded-md p-3 max-h-64 overflow-auto">
            <pre className="text-xs text-gray-700 whitespace-pre-wrap">
              {xmlContent}
            </pre>
          </div>

          <div className="text-xs text-gray-600">
            <p>💡 <strong>XML Intermediário:</strong> Estrutura padronizada para auditoria e reprocessamento</p>
            <p>📊 <strong>Confiabilidade:</strong> {confiabilidade}% - {getConfiabilityText(confiabilidade)}</p>
          </div>
        </div>
      )}
    </Card>
  );
}
