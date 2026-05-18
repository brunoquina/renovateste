const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

const API_KEY = "pk_live_v2Zf4wNjOjpvigiAv0Mb6eXwn4lBCmJCQj"; 

app.post('/api/gerar-pix', async (req, res) => {
    try {
        const { name, email, cpf, phone, amount } = req.body;
        const payload = {
            payment_method: "pix",
            amount: Math.round(amount * 100),
            customer: {
                name: name,
                email: email,
                document: cpf.replace(/\D/g, ''),
                phone_number: phone.replace(/\D/g, '')
            },
            items: [{ title: "Kit Promocional", unit_price: Math.round(amount * 100), quantity: 1 }]
        };

        const response = await axios.post('https://api.assetpay.com.br/api/v1/transactions', payload, {
            headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' }
        });

        res.json({ success: true, pix_code: response.data.pix_qr_code });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));
