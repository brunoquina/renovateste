```js
// server.js

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

const SECRET_KEY = process.env.SECRET_KEY;
const PUBLIC_KEY = process.env.PUBLIC_KEY;

app.post('/api/gerar-pix', async (req, res) => {

    try {

        const { name, email, cpf, phone, amount } = req.body;

        const valorCentavos = Math.round(Number(amount) * 100);

        const payload = {
            amount: valorCentavos,
            paymentMethod: "PIX",

            customer: {
                name: name,
                email: email,
                phone: phone.replace(/\D/g, ''),
                document: {
                    type: "CPF",
                    number: cpf.replace(/\D/g, '')
                }
            },

            items: [
                {
                    title: "Kit Promocional",
                    unitPrice: valorCentavos,
                    quantity: 1
                }
            ],

            pix: {
                expiresInDays: 1
            }
        };

        const auth = Buffer
            .from(`${SECRET_KEY}:${PUBLIC_KEY}`)
            .toString('base64');

        const response = await axios.post(
            'https://api.assetpay.com.br/api/v1/transactions',
            payload,
            {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log("PIX GERADO:");
        console.log(response.data);

        res.json({
            success: true,
            pix_code: response.data.pix.qrcode,
            pix_qrcode: response.data.pix.qrcodeUrl
        });

    } catch (error) {

        console.log("ERRO AO GERAR PIX");

        if (error.response) {

            console.log(error.response.data);

            return res.status(500).json({
                success: false,
                error: error.response.data
            });
        }

        console.log(error.message);

        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
```
