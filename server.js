const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// 1. VERIFICAÇÃO: Certifica-te que não há espaços antes ou depois da chave
const SECRET_KEY = "sk_live_v2XTGFli2wGd1fmZVU5k3FpLeLuIvj0RRp";

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
            items: [{
                title: "Kit Promocional",
                unit_price: Math.round(parseFloat(amount) * 100),
                quantity: 1
            }]
        };

        // 2. TÉCNICA DE AUTENTICAÇÃO: 
        // Geramos o Base64 garantindo que o formato seja exatamente "chave:"
        const authBase64 = Buffer.from(`${SECRET_KEY}:`).toString('base64');

        const response = await axios.post('https://api.assetpay.com.br/api/v1/transactions', payload, {
            headers: {
                'Authorization': `Basic ${authBase64}`,
                'Content-Type': 'application/json'
            }
        });

        const pixCode = response.data.pix_qr_code || 
                        (response.data.payment_details && response.data.payment_details.pix_qr_code);

        res.json({ success: true, pix_code: pixCode });

    } catch (error) {
        // Log detalhado para veres no Render qual é a resposta exata da API
        const errorData = error.response ? error.response.data : error.message;
        console.error('ERRO ASSETPAY:', JSON.stringify(errorData));
        
        res.status(500).json({ 
            success: false, 
            message: "Erro na API", 
            details: errorData 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor Ativo`));
