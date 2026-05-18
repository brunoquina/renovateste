const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// SUA CHAVE DA ASSETPAY
const API_KEY = "pk_live_v2Zf4wNjOjpvigiAv0Mb6eXwn4lBCmJCQj";

app.post('/api/gerar-pix', async (req, res) => {
    try {
        const { name, email, cpf, phone, amount } = req.body;

        const payload = {
            payment_method: "pix",
            amount: Math.round(parseFloat(amount) * 100),
            customer: {
                name: name,
                email: email,
                document: cpf.replace(/\D/g, ''),
                phone_number: phone.replace(/\D/g, '')
            },
            items: [
                {
                    title: "Pedido Checkout",
                    unit_price: Math.round(parseFloat(amount) * 100),
                    quantity: 1
                }
            ]
        };

        // CORREÇÃO AQUI: Gerando o Token Base64 para o Header de autorização
        const token = Buffer.from(`${API_KEY}:`).toString('base64');

        const response = await axios.post('https://api.assetpay.com.br/api/v1/transactions', payload, {
            headers: {
                'Authorization': `Basic ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log("Sucesso AssetPay:", response.data);

        // Ajuste para pegar o código pix correto conforme o retorno da API
        const pixCode = response.data.pix_qr_code || (response.data.payment_details && response.data.payment_details.pix_qr_code);

        res.json({
            success: true,
            pix_code: pixCode
        });

    } catch (error) {
        console.error('ERRO NA ASSETPAY:', error.response ? error.response.data : error.message);
        res.status(500).json({ 
            success: false, 
            error: error.response ? error.response.data.message : "Erro interno" 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
