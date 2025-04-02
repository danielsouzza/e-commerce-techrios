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

function formatarHora(dataHora) {
    if (typeof dataHora === "string" && dataHora.includes(' ')) {
        const [data, hora] = dataHora.split(' ');
        if (hora) {
            const [horas, minutos] = hora.split(':');
            const horasFormatadas = String(parseInt(horas, 10)).padStart(2, '0');
            const minutosFormatados = String(parseInt(minutos, 10)).padStart(2, '0');
            return `${horasFormatadas}H${minutosFormatados}`;
        }
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
    const municipio = municipioList.find(it => it.slug == codigo);
    return municipioLabel(municipio);
}

function municipioLabel(municipio) {
    return municipio ? `${municipio.nome},${municipio.uf}` : '';
}

function formatMoney(money) {
    return parseFloat(money.replace("R$ ","").replace(".","").replace(" ","").replace(",","."))
}

function calcularValorParcelado(data) {
    let valor = formatMoney(data.valor);
    let desconto = data?.desconto ? data.desconto.desconto : 0;
    let valorComDesconto = valor - desconto;
    let valorFinal = (valorComDesconto + (valorComDesconto * 0.10)) / 6;

    return formatCurrency(valorComDesconto);
}

function calcularValorPix(data) {
    let valor = formatMoney(data.valor);
    let desconto = data?.desconto ? data.desconto.desconto : 0;
    let valorComDesconto = valor - desconto;
    let valorFinal = valorComDesconto - (valorComDesconto * 0.04);

    return formatCurrency(valorFinal);
}

function calcularValor(valor, desconto = null, percent = 0) {
    let desc  = desconto ? desconto : 0;
    let valorComDesconto = valor - desc;
    let valorFinal = valorComDesconto - (valorComDesconto * percent);
    return (valorFinal);
}

function converterData(data) {
    const [dia, mes, ano] = data.split('/');
    return `${ano}-${mes}-${dia}`;
}

function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        return false;
    }
    let soma = 0, resto;

    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto !== parseInt(cpf.charAt(10))) return false;

    return true;
}

function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}


function isValidDate(dateString) {
    const date = new Date(converterData(dateString) + 'T00:00:00')
    return !isNaN(date.getTime())
}

function permitirDatasNascimento(data) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataSelecionada = new Date(data);
    dataSelecionada.setHours(0, 0, 0, 0);

    return dataSelecionada < hoje;
}



export {formatCurrency, formatMoney,formatDateToServe,
    getMonicipioLabel, formatDate, formatarTempoViagem,
    gerarStringTiposComodos,municipioLabel,formatarHora,
    calcularValorParcelado,calcularValorPix,calcularValor,
    converterData,validarCPF,validarEmail,isValidDate,permitirDatasNascimento
};