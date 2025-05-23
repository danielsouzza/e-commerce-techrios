export function saveFormSaleToSession(formSale) {
    const dataToSave = {
        ...formSale,
        contato: { ...formSale.contato },
        dataComodos: [...formSale.dataComodos],
        dataVolta: formSale.dataVolta,
        trecho: formSale.trecho,
        viagem: formSale.viagem,
        data_hora: formSale.data_hora,
        total_passagems: formSale.total_passagems,
        total_taxas: formSale.total_taxas,
        // Não salva errors e processing
    };

    sessionStorage.setItem('form-sale', JSON.stringify(dataToSave));
}

export function restoreFormSaleFromSession(formSale) {
    const saved = sessionStorage.getItem('form-sale');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            Object.assign(formSale, parsed);
            console.log('Restaurado formSale:', formSale);
            formSale.errors = {};
            formSale.processing = false;
        } catch (e) {
            console.warn('Erro ao restaurar formSale:', e);
            sessionStorage.removeItem('form-sale');
        }
    }
}

export function saveConfirmPaymentToSession(data) {
    sessionStorage.setItem('oder-confirm-payment', JSON.stringify(data));
}

export function restoreConfirmPaymentToSession(formSale) {
    const saved = sessionStorage.getItem('oder-confirm-payment');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            Object.assign(formSale, parsed);
        } catch (e) {
            sessionStorage.removeItem('oder-confirm-payment');
        }
    }
}



export function clearConfirmPaymentToSession() {
    sessionStorage.removeItem('oder-confirm-payment');
}


export function clearFormSaleSession() {
    sessionStorage.removeItem('form-sale');
}
