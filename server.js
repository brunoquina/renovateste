const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// Suas credenciais fornecidas
const SECRET_KEY = "sk_live_v2XTGFli2wGd1fmZVU5k3FpLeLuIvj0RRp";

app.post('/api/gerar-pix', async (req, res) => {
    try {
        const { name, email, cpf, phone, amount } = req.body;

        // A documentação exige o valor em centavos (inteiro)
        const amountInCents = Math.round(parseFloat(amount) * 100);

        const payload = {
            payment_method: "pix",
            amount: amountInCents,
            customer: {
                name: name,
                email: email,
                document: cpf.replace(/\D/g, ''),
                phone_number: phone.replace(/\D/g, '')
            },
            items: [{
                title: "Kit Promocional",
                unit_price: amountInCents,
                quantity: 1
            }]
        };

        // Conforme a documentação: Autenticação Basic (Chave:Vazio) em Base64
        const authHeader = 'Basic ' + Buffer.from(SECRET_KEY + ':').toString('base64');

        const response = await axios.post('https://api.assetpay.com.br/api/v1/transactions', payload, {
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        // Extração do código PIX da resposta
        const pixCode = response.data.pix_qr_code || 
                        (response.data.payment_details && response.data.payment_details.pix_qr_code);

        res.json({ success: true, pix_code: pixCode });

    } catch (error) {
        // Log para depuração no console do servidor
        console.error('ERRO ASSETPAY:', error.response ? JSON.stringify(error.response.data) : error.message);
        
        res.status(error.response ? error.response.status : 500).json({ 
            success: false, 
            error: error.response ? error.response.data : error.message 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
