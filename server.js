const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// CHAVE SECRETA (Sempre use a sk_live para operações reais)
const SECRET_KEY = "sk_live_v2XTGFli2wGd1fmZVU5k3FpLeLuIvj0RRp";

app.post('/api/gerar-pix', async (req, res) => {
    try {
        const { name, email, cpf, phone, amount } = req.body;

        // Limpeza de dados para garantir que a API aceite
        const cleanCPF = cpf.replace(/\D/g, '');
        const cleanPhone = phone.replace(/\D/g, '');
        const amountInCents = Math.round(parseFloat(amount) * 100);

        const payload = {
            payment_method: "pix",
            amount: amountInCents,
            customer: {
                name: name,
                email: email,
                document: cleanCPF,
                phone_number: cleanPhone
            },
            items: [{
                title: "Produto Checkout",
                unit_price: amountInCents,
                quantity: 1
            }]
        };

        // Chamada oficial seguindo a documentação V1
        const response = await axios.post('https://api.assetpay.com.br/api/v1/transactions', payload, {
            auth: {
                username: SECRET_KEY,
                password: '' // Obrigatório ser vazio conforme a especificação de Basic Auth deles
            },
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        // A API V1 retorna o link ou o código do PIX dentro de 'payment_details' ou na raiz
        const pixData = response.data;
        const pixCode = pixData.pix_qr_code || 
                        (pixData.payment_details ? pixData.payment_details.pix_qr_code : null);

        if (!pixCode) {
            throw new Error("Resposta da API não contém pix_qr_code");
        }

        res.json({ success: true, pix_code: pixCode });

    } catch (error) {
        // Log detalhado para capturar o motivo real do erro nos logs do Render
        const errorDetail = error.response ? error.response.data : error.message;
        console.error('ERRO ASSETPAY:', JSON.stringify(errorDetail));
        
        res.status(500).json({ 
            success: false, 
            message: "Erro na autenticação ou processamento",
            details: errorDetail 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
