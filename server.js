const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// ENV NO RENDER
const API_KEY = process.env.API_KEY;
const PLATFORM_ID = process.env.PLATFORM_ID;

app.post('/api/gerar-pix', async (req, res) => {

    try {

        const { name, email, cpf, phone, amount } = req.body;

        const payload = {
            name: name,
            email: email,
            phone: phone.replace(/\D/g, ''),
            document: cpf.replace(/\D/g, ''),
            amount: Number(amount),
            description: "Kit Promocional",
            platform: PLATFORM_ID
        };

        console.log("PAYLOAD ENVIADO:");
        console.log(payload);

        const response = await axios.post(
            'https://painel.virtualpay.com.br/api/v1/transaction/pix/cashin',
            payload,
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }
        );

        console.log("RESPOSTA API:");
        console.log(response.data);

        res.json({
            success: true,
            data: response.data
        });

    } catch (error) {

        console.log("ERRO COMPLETO:");

        if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);

            return res.status(500).json({
                success: false,
                error: error.response.data
            });
        }

        console.log(error.message);

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
