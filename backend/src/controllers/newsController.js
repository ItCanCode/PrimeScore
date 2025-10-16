//this fetches top sports headlines via axios
//accepts an optional country quesry param
//sends json to the frontend 

import axios from "axios";

export const getSportsNews = async (req, res) => {
    try {
        const apiKey = process.env.NEWSDATA_API_KEY;
        const { q = "sports", country } = req.query;

        const params = {
            apikey: apiKey,
            q,
            category: "sports",
        };

        // Add country if specified
        if (country) {
            params.country = country;
        }

        const response = await axios.get("https://newsdata.io/api/1/latest", {
            params,
        });

        res.json(response.data);
    } catch (error) {
        console.error("error fetching sports news", error.message);
        res.status(500).json({message: "Failed to fetch sports news"});
    }
};