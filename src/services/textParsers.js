// Utilitários para parse de textos de NFS-e (diferentes municípios)

// Remove formatação de CNPJ/CPF e mantém apenas dígitos
const normalizeInscricao = (value) => {
  if (!value) return '';
  return String(value).replace(/[^0-9]/g, '');
};

// Converte string monetária pt-BR para número (e.g., "1.150,00" -> 1150.00)
const parseCurrency = (value) => {
  if (value === null || value === undefined) return 0;
  const str = String(value).trim();
  if (!str) return 0;
  const normalized = str.replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
  const num = parseFloat(normalized);
  return isNaN(num) ? 0 : num;
};

// Encontra primeira ocorrência de data dd/mm/yyyy (com ou sem hora)
const extractFirstDateTime = (text) => {
  const dateTimeRegex = /([0-3]\d\/[01]\d\/\d{4})(?:\s+(\d{2}:\d{2}:\d{2}))?/;
  const match = text.match(dateTimeRegex);
  if (!match) return '';
  const [_, date, time] = match;
  // Retorna ISO se possível
  try {
    const [d, m, y] = date.split('/').map((v) => parseInt(v, 10));
    if (!time) {
      return new Date(y, m - 1, d).toISOString();
    }
    const [hh, mm, ss] = time.split(':').map((v) => parseInt(v, 10));
    return new Date(y, m - 1, d, hh, mm, ss).toISOString();
  } catch {
    return date;
  }
};

// Extrai bloco de texto entre dois marcadores (inclusive start, exclusive end)
const sliceBetween = (text, startMarker, endMarker) => {
  const startIdx = text.search(startMarker);
  if (startIdx === -1) return '';
  const rest = text.slice(startIdx + (text.match(startMarker)?.[0]?.length || 0));
  if (!endMarker) return rest;
  const endIdx = rest.search(endMarker);
  return endIdx === -1 ? rest : rest.slice(0, endIdx);
};

// Helper: constrói regex tolerante para rótulos com variações comuns (OCR/acentos/separadores)
const buildLabelRegex = (labels) => {
  // Aceita ":", "-", "–" como separadores; aceita espaços/linhas entre rótulo e valor; captura até fim da linha
  const sep = String.raw`\s*[:\-–]?\s*`;
  const value = String.raw`([^\r\n]+)`;
  const group = labels.map((l) => `(?:${l})`).join('|');
  return new RegExp(`(?:${group})${sep}${value}`, 'i');
};

// Helper: captura valor após o rótulo; se vazio, tenta próxima linha
const captureAfterLabel = (text, labelRegexes) => {
  for (const rx of labelRegexes) {
    const m = text.match(rx);
    if (m && m[1]) {
      const val = m[1].trim();
      if (val) return val;
      // fallback: tenta próxima linha
      const idx = m.index ?? text.search(rx);
      if (idx >= 0) {
        const after = text.slice(idx);
        const lines = after.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
        if (lines.length >= 2) {
          return lines[1];
        }
      }
    }
  }
  return '';
};

// Parser específico para Chapecó
const parseChapeco = (text) => {
  const lower = text.toLowerCase();
  if (!lower.includes('município de chapecó') && !lower.includes('municipio de chapeco')) return null;

  const result = {};

  // Número da nota: "Nota Nº - Série\n0000000112 - E"
  const notaMatch = text.match(/Nota\s*N[ºo]\s*-\s*S[eé]rie[\s\r\n]+([0-9\.]+)\s*-\s*([A-Z0-9]+)/i);
  if (notaMatch) {
    result.numeroNota = notaMatch[1];
  }

  // Datas
  const emissaoMatch = text.match(/Data da Emiss[aã]o:\s*([0-3]\d\/[01]\d\/\d{4})(?:\s+(\d{2}:\d{2}:\d{2}))?/i);
  if (emissaoMatch) {
    const [_, d, t] = emissaoMatch;
    try {
      const [dd, mm, yy] = d.split('/').map((v) => parseInt(v, 10));
      if (t) {
        const [hh, mi, ss] = t.split(':').map((v) => parseInt(v, 10));
        result.dataEmissao = new Date(yy, mm - 1, dd, hh, mi, ss).toISOString();
      } else {
        result.dataEmissao = new Date(yy, mm - 1, dd).toISOString();
      }
    } catch {
      result.dataEmissao = d;
    }
  }

  // Prestador (bloco antes do TOMADOR)
  const prestadorBlock = sliceBetween(text, /PRESTADOR DE SERVI[ÇC]OS/i, /TOMADOR DE SERVI[ÇC]OS/i);
  if (prestadorBlock) {
    // Rótulos tolerantes para razão social ("Nome/Razão Social", "Razao Social", erros de OCR como "Razéo")
    const razaoLabels = [
      String.raw`Nome\s*[\/\\\-–]?\s*Raz[ãaáàâäe][o0óòôö]?\s*Social`,
      String.raw`Raz[ãaáàâäe][o0óòôö]?\s*Social`,
      String.raw`Nome\s*Fantasia`,
    ];
    const razaoRegexes = [buildLabelRegex(razaoLabels)];
    const razaoPrest = captureAfterLabel(prestadorBlock, razaoRegexes);
    if (razaoPrest) result.razaoSocial = razaoPrest;

    // CNPJ/CPF tolerante
    const docLabels = [
      String.raw`CPF\s*[\/\\\-–]?\s*CNPJ`,
      String.raw`CNPJ\s*[\/\\\-–]?\s*CPF`,
      String.raw`CNPJ\/CPF`,
      String.raw`CPF\/CNPJ`,
      String.raw`CNPJ`,
      String.raw`CPF`,
      String.raw`CPFCNPJ`,
    ];
    const docRegexes = [
      new RegExp(`(?:${docLabels.join('|')})\s*[:\-–]?\s*([\d\./\-\s]+)`, 'i'),
    ];
    const docPrest = captureAfterLabel(prestadorBlock, docRegexes);
    if (docPrest) result.inscricaoFederal = normalizeInscricao(docPrest);
  }

  // Tomador
  const tomadorBlock = sliceBetween(text, /TOMADOR DE SERVI[ÇC]OS/i, /LOCAL DA PRESTA[ÇC][ÃA]O|DISCRIMINA[ÇC][ÃA]O DOS SERVI[ÇC]OS|Situa[çc][aã]o de Tributa[çc][aã]o|Página\s+1\s+de\s+1/i);
  if (tomadorBlock) {
    const razaoLabels = [
      String.raw`Nome\s*[\/\\\-–]?\s*Raz[ãaáàâäe][o0óòôö]?\s*Social`,
      String.raw`Raz[ãaáàâäe][o0óòôö]?\s*Social`,
      String.raw`Nome\s*Fantasia`,
    ];
    const razaoRegexes = [buildLabelRegex(razaoLabels)];
    const razaoTom = captureAfterLabel(tomadorBlock, razaoRegexes);
    if (razaoTom) result.razaoSocialTomador = razaoTom;

    const docLabels = [
      String.raw`CPF\s*[\/\\\-–]?\s*CNPJ`,
      String.raw`CNPJ\s*[\/\\\-–]?\s*CPF`,
      String.raw`CNPJ\/CPF`,
      String.raw`CPF\/CNPJ`,
      String.raw`CNPJ`,
      String.raw`CPF`,
      String.raw`CPFCNPJ`,
    ];
    const docRegexes = [
      new RegExp(`(?:${docLabels.join('|')})\s*[:\-–]?\s*([\d\./\-\s]+)`, 'i'),
    ];
    const docTom = captureAfterLabel(tomadorBlock, docRegexes);
    if (docTom) result.inscricaoFederalTomador = normalizeInscricao(docTom);
  }

  // Natureza (pegar descrição do Código do Serviço)
  // Padrão: linha após "Código do Serviço" costuma ser "901 - descrição" ou "1703 - descrição"
  let natureza = '';
  const codServicoBlock = sliceBetween(text, /C[óo]digo do Servi[cç]o/i);
  if (codServicoBlock) {
    const codeLine = codServicoBlock.match(/\b([0-9]{2,6})\s*-\s*([^\n\r]+)/);
    if (codeLine) {
      natureza = `${codeLine[2].trim()}`;
      result.cfop = '';
      result.cfopNatureza = '';
    }
  }

  // Valores
  const valorLiquidoMatch = text.match(/VALOR L[IÍ]QUIDO DA NOTA\s*R\$\s*([\d\.,]+)/i);
  if (valorLiquidoMatch) result.valorLiquido = parseCurrency(valorLiquidoMatch[1]);
  const valorTotalMatch = text.match(/VALOR TOTAL\s*\(R\$\)\s*([\d\.,]+)/i);
  if (valorTotalMatch) result.valorPrincipal = parseCurrency(valorTotalMatch[1]);
  if (result.valorPrincipal === undefined && result.valorLiquido !== undefined) {
    result.valorPrincipal = result.valorLiquido;
  }

  // Retenções (linha que lista INSS/IR/PIS/COFINS/CSLL)
  const retBlockLineIdx = text.search(/INSS\(R\$\).*IR\(R\$\).*PIS\(R\$\).*COFINS\(R\$\).*CSLL\(R\$\)/i);
  if (retBlockLineIdx !== -1) {
    const after = text.slice(retBlockLineIdx);
    const lineMatches = after.split(/\r?\n/).slice(1, 3).join(' ');
    const nums = lineMatches.match(/([\d\.,]+)/g) || [];
    if (nums.length >= 5) {
      result.inssRetid = parseCurrency(nums[0]);
      result.irRetid = parseCurrency(nums[1]);
      result.pisRetid = parseCurrency(nums[2]);
      result.cofinsRetid = parseCurrency(nums[3]);
      result.csRetid = parseCurrency(nums[4]);
    }
  }

  // ISS (linhas com "VALOR ISS(R$)" ou "Valor do ISS (R$)")
  const issMatch = text.match(/VALOR ISS\(R\$\)\s*([\d\.,]+)/i) || text.match(/Valor do ISS\s*\(R\$\)\s*([\d\.,]+)/i);
  if (issMatch) result.issRetid = parseCurrency(issMatch[1]);

  if (natureza) result.natureza = natureza;
  return result;
};

// Parser específico para São Paulo (NFS-e)
const parseSaoPaulo = (text) => {
  const lower = text.toLowerCase();
  // Heurística: menção a PREFEITURA DO MUNICÍPIO DE SAO PAULO e NFS-e
  if (!lower.includes('prefeitura do municipio de sao paulo') && !lower.includes('prefeitura do municipio de são paulo')) return null;

  const result = {};

  // Número da Nota: pode não estar claro; usar RPS como fallback
  const rpsMatch = text.match(/RPS\s*N[ºo]\s*([0-9\.]+)/i);
  if (rpsMatch) result.numeroNota = rpsMatch[1];

  // Data Emissão (buscar primeira ocorrência no topo)
  result.dataEmissao = extractFirstDateTime(text);

  // Prestador
  const prestadorBlockSP = sliceBetween(text, /PRESTADOR DE SERVI[ÇC]OS/i, /TOMADOR DE SERVI[ÇC]OS/i);
  if (prestadorBlockSP) {
    const razaoLabels = [
      String.raw`Nome\s*[\/\\\-–]?\s*Raz[ãaáàâäe][o0óòôö]?\s*Social`,
      String.raw`Raz[ãaáàâäe][o0óòôö]?\s*Social`,
      String.raw`Nome\s*Fantasia`,
      String.raw`Nome\s*\/\s*Raz[\w]+\s*Social`,
    ];
    const razaoRegexes = [buildLabelRegex(razaoLabels)];
    const razaoPrest = captureAfterLabel(prestadorBlockSP, razaoRegexes);
    if (razaoPrest) result.razaoSocial = razaoPrest;

    const docLabels = [
      String.raw`CPF\s*[\/\\\-–]?\s*CNPJ`,
      String.raw`CNPJ\s*[\/\\\-–]?\s*CPF`,
      String.raw`CNPJ\/CPF`,
      String.raw`CPF\/CNPJ`,
      String.raw`CNPJ`,
      String.raw`CPF`,
      String.raw`CPFCNPJ`,
    ];
    const docRegexes = [
      new RegExp(`(?:${docLabels.join('|')})\s*[:\-–]?\s*([\d\./\-\s]+)`, 'i'),
    ];
    const docPrest = captureAfterLabel(prestadorBlockSP, docRegexes);
    if (docPrest) result.inscricaoFederal = normalizeInscricao(docPrest);
  }

  // Tomador
  const tomadorBlockSP = sliceBetween(text, /TOMADOR DE SERVI[ÇC]OS/i, /INTERMEDIARIO DE SERVI[ÇC]OS|DISCRIMIN|LOCAL DA PRESTA[ÇC][ÃA]O|OUTRAS INFORM/i);
  if (tomadorBlockSP) {
    const razaoLabels = [
      String.raw`Nome\s*[\/\\\-–]?\s*Raz[ãaáàâäe][o0óòôö]?\s*Social`,
      String.raw`Raz[ãaáàâäe][o0óòôö]?\s*Social`,
      String.raw`Nome\s*Fantasia`,
      String.raw`Nome\s*\/\s*Raz[\w]+\s*Social`,
    ];
    const razaoRegexes = [buildLabelRegex(razaoLabels)];
    const razaoTom = captureAfterLabel(tomadorBlockSP, razaoRegexes);
    if (razaoTom) result.razaoSocialTomador = razaoTom;

    const docLabels = [
      String.raw`CPF\s*[\/\\\-–]?\s*CNPJ`,
      String.raw`CNPJ\s*[\/\\\-–]?\s*CPF`,
      String.raw`CNPJ\/CPF`,
      String.raw`CPF\/CNPJ`,
      String.raw`CNPJ`,
      String.raw`CPF`,
      String.raw`CPFCNPJ`,
    ];
    const docRegexes = [
      new RegExp(`(?:${docLabels.join('|')})\s*[:\-–]?\s*([\d\./\-\s]+)`, 'i'),
    ];
    const docTom = captureAfterLabel(tomadorBlockSP, docRegexes);
    if (docTom) result.inscricaoFederalTomador = normalizeInscricao(docTom);
  }

  // Natureza: linha com código do serviço "NNNNN - descrição"
  const codeDescMatch = text.match(/\b([0-9]{4,6})\s*-\s*([^\n\r]+)$/im) || sliceBetween(text, /(C[óo]digo|Cadig[nm])\s+do\s+Servi[cç]o/i).match(/\b([0-9]{4,6})\s*-\s*([^\n\r]+)/);
  if (codeDescMatch) {
    result.natureza = codeDescMatch[2].trim();
  }

  // Valores
  const valorTotalServicoMatch = text.match(/VALOR TOTAL DO SERVI[ÇC]O\s*=\s*R\$\s*([\d\.,]+)/i) || text.match(/valor Total\s*-\s*R\$\s*([\d\.,]+)/i);
  if (valorTotalServicoMatch) result.valorPrincipal = parseCurrency(valorTotalServicoMatch[1]);
  const valorLiquidoMatch = text.match(/VALOR L[IÍ]QUIDO DA NOTA\s*R\$\s*([\d\.,]+)/i);
  if (valorLiquidoMatch) result.valorLiquido = parseCurrency(valorLiquidoMatch[1]);
  if (result.valorLiquido === undefined && result.valorPrincipal !== undefined) {
    result.valorLiquido = result.valorPrincipal;
  }

  // ISS (linhas com "Valor do ISS (R$)" e tabela)
  const issMatch = text.match(/Valor do ISS\s*\(R\$\)\s*([\d\.,]+)/i) || text.match(/VALOR ISS\(R\$\)\s*([\d\.,]+)/i);
  if (issMatch) result.issRetid = parseCurrency(issMatch[1]);

  return result;
};

// Parser genérico: tenta São Paulo, depois Chapecó, senão retorna extrações básicas por regex comuns
export const parseNfseText = (text) => {
  if (!text || typeof text !== 'string') return null;

  const parsers = [parseSaoPaulo, parseChapeco];
  for (const p of parsers) {
    try {
      const parsed = p(text);
      if (parsed && Object.keys(parsed).length > 0) {
        return parsed;
      }
    } catch {
      // ignora e tenta próximo parser
    }
  }

  // Fallback genérico
  const result = {};

  // Número da nota
  const numeroGeneric = text.match(/Nota\s*N[ºo].{0,20}?([0-9]{6,})/i) || text.match(/RPS\s*N[ºo]\s*([0-9\.]+)/i);
  if (numeroGeneric) result.numeroNota = numeroGeneric[1];

  // Data de emissão
  const dt = extractFirstDateTime(text);
  if (dt) result.dataEmissao = dt;

  // Prestador
  const razaoPrest = text.match(/(Nome\/Raz[aã]o Social|Raz[aã]o Social):\s*(.+)/i);
  if (razaoPrest) result.razaoSocial = razaoPrest[2].trim();
  const cnpjPrest = text.match(/(CPF\/CNPJ|CNPJ\/CPF):\s*([\d\./\-]+)/i);
  if (cnpjPrest) result.inscricaoFederal = normalizeInscricao(cnpjPrest[2]);

  // Natureza por código + descrição (primeiro que aparecer)
  const codeDesc = text.match(/\b([0-9]{3,6})\s*-\s*([^\n\r]+)/);
  if (codeDesc) result.natureza = codeDesc[2].trim();

  // Valores
  const vliq = text.match(/VALOR L[IÍ]QUIDO DA NOTA\s*R\$\s*([\d\.,]+)/i);
  if (vliq) result.valorLiquido = parseCurrency(vliq[1]);
  const vtot = text.match(/VALOR TOTAL(?:\s*DO\s*SERVI[ÇC]O)?\s*(?:=)?\s*R\$\s*([\d\.,]+)/i);
  if (vtot) result.valorPrincipal = parseCurrency(vtot[1]);
  if (result.valorPrincipal === undefined && result.valorLiquido !== undefined) {
    result.valorPrincipal = result.valorLiquido;
  }

  return result;
};

export default parseNfseText;