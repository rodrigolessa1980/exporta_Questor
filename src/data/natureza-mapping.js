// Mapeamento estático de Natureza → CFOP → TABELA CTB
// Este arquivo contém o mapeamento baseado na coluna #NATUREZA
// para preenchimento automático das colunas CFOP Natureza e TABELA CTB

export const NATUREZA_MAPPING = {
  // Serviços de consultoria e gestão - dentro do estado
  "Serviço de consultoria e gestão - dentro do estado": {
    cfop: "1933034",
    tabelaCtb: "2014",
    descricao: "Serviços de consultoria e gestão empresarial"
  },
  
  // Serviços de software - fora do Estado
  "Serviço software - fora do Estado": {
    cfop: "2933027",
    tabelaCtb: "2007",
    descricao: "Serviços de desenvolvimento de software"
  },
  
  // Serviços advocatícios - fora do Estado
  "Serviço honorários advocatícios - fora do Estado": {
    cfop: "2933029",
    tabelaCtb: "2009",
    descricao: "Serviços advocatícios e jurídicos"
  },
  
  // Serviços advocatícios com retido - fora do Estado
  "Serviço honorários advocatícios com retido - fora do Estado": {
    cfop: "2933030",
    tabelaCtb: "2010",
    descricao: "Serviços advocatícios com retenções"
  },
  
  // Serviços administrativos com retido - dentro do estado
  "Serviço administrativos com retido - dentro do estado": {
    cfop: "1933023",
    tabelaCtb: "2003",
    descricao: "Serviços administrativos com retenções"
  },
  
  // Serviços contábeis - dentro do estado
  "Serviço honorários contábeis - dentro do estado": {
    cfop: "1933032",
    tabelaCtb: "2012",
    descricao: "Serviços contábeis e tributários"
  },
  
  // Serviços de hospedagem - fora do Estado
  "Serviço hospedagem de websites - fora do Estado": {
    cfop: "2933035",
    tabelaCtb: "2015",
    descricao: "Serviços de hospedagem e tecnologia"
  },
  
  // Serviços de despesas médicas - dentro do estado
  "Serviço despesas médicas - dentro do estado": {
    cfop: "1933025",
    tabelaCtb: "2005",
    descricao: "Serviços médicos e hospitalares"
  },
  
  // Serviços de despesas médicas com retido - dentro do estado
  "Serviço despesas médicas com retido - dentro do estado": {
    cfop: "1933023",
    tabelaCtb: "2003",
    descricao: "Serviços médicos com retenções"
  },
  
  // Código 101 - Serviços médicos/exames (NFSe)
  "101": {
    cfop: "1933025",
    tabelaCtb: "2005",
    descricao: "Serviços médicos e exames laboratoriais"
  },
  
  // Padrões genéricos para serviços similares
  "Serviço de consultoria": {
    cfop: "1933034",
    tabelaCtb: "2014",
    descricao: "Serviços de consultoria empresarial"
  },
  
  "Serviço de gestão": {
    cfop: "1933034",
    tabelaCtb: "2014",
    descricao: "Serviços de gestão empresarial"
  },
  
  "Serviço de software": {
    cfop: "2933027",
    tabelaCtb: "2007",
    descricao: "Serviços de desenvolvimento de software"
  },
  
  "Serviço de advocacia": {
    cfop: "2933029",
    tabelaCtb: "2009",
    descricao: "Serviços advocatícios"
  },
  
  "Serviço de contabilidade": {
    cfop: "1933032",
    tabelaCtb: "2012",
    descricao: "Serviços contábeis"
  },
  
  "Serviço de hospedagem": {
    cfop: "2933035",
    tabelaCtb: "2015",
    descricao: "Serviços de hospedagem"
  },
  
  "Serviço médico": {
    cfop: "1933025",
    tabelaCtb: "2005",
    descricao: "Serviços médicos"
  },
  
  "Serviço hospitalar": {
    cfop: "1933025",
    tabelaCtb: "2005",
    descricao: "Serviços hospitalares"
  }
};

// Função para encontrar o mapeamento baseado na natureza
export const findNaturezaMapping = (natureza) => {
  if (!natureza) return null;
  
  // Busca exata primeiro - prioridade máxima
  if (NATUREZA_MAPPING[natureza]) {
    return NATUREZA_MAPPING[natureza];
  }
  
  // Busca por correspondência exata de palavras-chave importantes
  const naturezaLower = natureza.toLowerCase().trim();
  
  // Lista de palavras-chave prioritárias para busca exata
  const keywords = [
    'despesas médicas com retido',
    'administrativos com retido',
    'honorários advocatícios com retido',
    'honorários contábeis',
    'consultoria e gestão',
    'software',
    'hospedagem de websites'
  ];
  
  // Busca por correspondência exata de palavras-chave
  for (const keyword of keywords) {
    if (naturezaLower.includes(keyword.toLowerCase())) {
      // Encontra o mapeamento que contém essa palavra-chave
      for (const [key, mapping] of Object.entries(NATUREZA_MAPPING)) {
        if (key.toLowerCase().includes(keyword.toLowerCase())) {
          return mapping;
        }
      }
    }
  }
  
  // Busca parcial por palavras-chave como fallback
  for (const [key, mapping] of Object.entries(NATUREZA_MAPPING)) {
    const keyLower = key.toLowerCase();
    
    // Verifica se a natureza contém palavras-chave do mapeamento
    if (keyLower.includes('consultoria') && naturezaLower.includes('consultoria')) {
      return mapping;
    }
    if (keyLower.includes('gestão') && naturezaLower.includes('gestão')) {
      return mapping;
    }
    if (keyLower.includes('software') && naturezaLower.includes('software')) {
      return mapping;
    }
    if (keyLower.includes('advocatícios') && naturezaLower.includes('advocatícios')) {
      return mapping;
    }
    if (keyLower.includes('contábeis') && naturezaLower.includes('contábeis')) {
      return mapping;
    }
    if (keyLower.includes('hospedagem') && naturezaLower.includes('hospedagem')) {
      return mapping;
    }
    if (keyLower.includes('médicas') && naturezaLower.includes('médicas')) {
      return mapping;
    }
    if (keyLower.includes('administrativos') && naturezaLower.includes('administrativos')) {
      return mapping;
    }
  }
  
  return null;
};

// Função para obter todos os mapeamentos disponíveis
export const getAllNaturezaMappings = () => {
  return NATUREZA_MAPPING;
};

// Função para validar se uma natureza tem mapeamento
export const hasNaturezaMapping = (natureza) => {
  return findNaturezaMapping(natureza) !== null;
};
