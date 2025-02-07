const formatCurrency = (number) => {
    if(!number){
        return '';
    }
    const formatter = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
    });
    return formatter.format(number);
}

function formatarTempoViagem(tempo_viagem) {
    if (typeof tempo_viagem === "number" || /^\d+$/.test(tempo_viagem)) {
        const horas = parseInt(tempo_viagem, 10);
        return `${String(horas).padStart(2, '0')}H00`;
    }

    if (typeof tempo_viagem === "string" && tempo_viagem.includes(':')) {
        const [horas, minutos] = tempo_viagem.split(':');
        const horasFormatadas = String(parseInt(horas, 10)).padStart(2, '0');
        const minutosFormatados = String(parseInt(minutos, 10)).padStart(2, '0');
        return `${horasFormatadas}H${minutosFormatados}`;
    }

    return "00H00";
}



function gerarStringTiposComodos(tiposComodos) {
    if (Array.isArray(tiposComodos)) {
        return tiposComodos.map(comodo => comodo.nome).join(" | ");
    }
    return "";
}

function formatDate(dateString) {
    if (!dateString) return null
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${day}/${month}/${year}`;
}

function formatDateToServe(inputDate) {
    if(!inputDate) return inputDate
    const date = new Date(inputDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}


function getMonicipioLabel(codigo, municipios, filtersData) {
    const municipioList = filtersData[municipios];
    if (!municipioList || !Array.isArray(municipioList)) return '';
    const municipio = municipioList.find(it => it.codigo == codigo);
    return municipioLabel(municipio);
}

function municipioLabel(municipio) {
    return municipio ? `${municipio.nome},${municipio.uf}` : '';
}

function formatMoney(money) {
    return money.replace("R$ ","").replace(".","").replace(" ","").replace(",",".")
}

export {formatCurrency, formatMoney,formatDateToServe,
    getMonicipioLabel, formatDate, formatarTempoViagem,
    gerarStringTiposComodos,municipioLabel};