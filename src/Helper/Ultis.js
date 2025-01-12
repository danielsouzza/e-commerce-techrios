const formatCurrency = (number) => {
    if (!number) {
        return "";
    }
    const formatter = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
    });
    return formatter.format(number);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${day}/${month}/${year}`;
}

function getMonicipioLabel(codigo, municipios, filtersData) {
    const municipioList = filtersData[municipios];
    if (!municipioList || !Array.isArray(municipioList)) return '';
    const municipio = municipioList.find(it => it.codigo == codigo);
    return municipio ? `${municipio.nome},${municipio.uf}` : '';
}

function formatMoney(money) {
    return money.replace("R$ ","").replace(".","").replace(" ","").replace(",",".")
}

export {formatCurrency, formatMoney, getMonicipioLabel, formatDate};