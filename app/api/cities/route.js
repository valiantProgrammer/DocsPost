import { NextResponse } from "next/server";

// Sample cities data by country
const citiesByCountry = {
    "United States": [
        "New York", "Los Angeles", "Chicago", "Houston", "Phoenix",
        "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose",
        "Austin", "Jacksonville", "Fort Worth", "Columbus", "Charlotte"
    ],
    "India": [
        "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai",
        "Kolkata", "Pune", "Jaipur", "Lucknow", "Chandigarh",
        "Ahmedabad", "Surat", "Indore", "Nagpur", "Bhopal"
    ],
    "United Kingdom": [
        "London", "Manchester", "Birmingham", "Leeds", "Glasgow",
        "Liverpool", "Newcastle", "Bristol", "Leicester", "Edinburgh",
        "Cambridge", "Oxford", "Bath", "York", "Brighton"
    ],
    "Canada": [
        "Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa",
        "Edmonton", "Winnipeg", "Quebec City", "Hamilton", "Kitchener",
        "London", "Victoria", "Windsor", "Halifax", "Saskatoon"
    ],
    "Australia": [
        "Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide",
        "Gold Coast", "Canberra", "Newcastle", "Wollongong", "Logan City",
        "Hobart", "Fremantle", "Parramatta", "Cairns", "Geelong"
    ],
    "Germany": [
        "Berlin", "Munich", "Frankfurt", "Hamburg", "Cologne",
        "Dresden", "Düsseldorf", "Dortmund", "Essen", "Leipzig",
        "Hanover", "Nuremberg", "Stuttgart", "Mannheim", "Augsburg"
    ],
    "France": [
        "Paris", "Marseille", "Lyon", "Toulouse", "Nice",
        "Nantes", "Strasbourg", "Montpellier", "Bordeaux", "Lille",
        "Rennes", "Reims", "Saint-Étienne", "Le Havre", "Toulon"
    ],
    "Japan": [
        "Tokyo", "Yokohama", "Osaka", "Nagoya", "Sapporo",
        "Fukuoka", "Kobe", "Kyoto", "Kawasaki", "Saitama",
        "Hiroshima", "Yonago", "Sendai", "Chiba", "Incheon"
    ],
    "China": [
        "Shanghai", "Beijing", "Shenzhen", "Guangzhou", "Chengdu",
        "Chongqing", "Hangzhou", "Wuhan", "Xi'an", "Tianjin",
        "Suzhou", "Nanjing", "Shenyang", "Qingdao", "Jinan"
    ],
};

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const country = searchParams.get("country");
        const search = searchParams.get("search")?.toLowerCase() || "";

        if (!country) {
            return NextResponse.json(
                { error: "Country is required" },
                { status: 400 }
            );
        }

        // Get cities for the selected country
        const cities = citiesByCountry[country] || [];

        // Filter cities based on search term
        const filteredCities = cities.filter(city =>
            city.toLowerCase().includes(search)
        ).slice(0, 10); // Limit to 10 suggestions

        return NextResponse.json({
            success: true,
            cities: filteredCities,
        });
    } catch (error) {
        console.error("Get cities error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch cities" },
            { status: 500 }
        );
    }
}
