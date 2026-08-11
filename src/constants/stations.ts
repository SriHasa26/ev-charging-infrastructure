export const MOCK_STATIONS = [
  // Delhi - Mumbai Route
  { id: 1, name: "Delhi EV Hub", lat: 28.6139, lng: 77.2090, type: "EV", status: "available", queueTime: 5, city: "Delhi", state: "Delhi", address: "Connaught Place, Delhi" },
  { id: 2, name: "Gurgaon CNG Point", lat: 28.4595, lng: 77.0266, type: "CNG", status: "available", queueTime: 10, city: "Gurgaon", state: "Haryana", address: "Sector 29, Gurgaon" },
  { id: 3, name: "Jaipur FastCharge", lat: 26.9124, lng: 75.7873, type: "EV", status: "available", queueTime: 8, city: "Jaipur", state: "Rajasthan", address: "C-Scheme, Jaipur" },
  { id: 4, name: "Ajmer CNG Station", lat: 26.4499, lng: 74.6399, type: "CNG", status: "busy", queueTime: 15, city: "Ajmer", state: "Rajasthan", address: "Pushkar Road, Ajmer" },
  { id: 5, name: "Udaipur EV Station", lat: 24.5854, lng: 73.7125, type: "EV", status: "available", queueTime: 2, city: "Udaipur", state: "Rajasthan", address: "Fateh Sagar, Udaipur" },
  { id: 6, name: "Ahmedabad CNG Hub", lat: 23.0225, lng: 72.5714, type: "CNG", status: "available", queueTime: 5, city: "Ahmedabad", state: "Gujarat", address: "SG Highway, Ahmedabad" },
  { id: 7, name: "Vadodara EV Point", lat: 22.3072, lng: 73.1812, type: "EV", status: "available", queueTime: 4, city: "Vadodara", state: "Gujarat", address: "Alkapuri, Vadodara" },
  { id: 8, name: "Surat CNG Station", lat: 21.1702, lng: 72.8311, type: "CNG", status: "busy", queueTime: 12, city: "Surat", state: "Gujarat", address: "Adajan, Surat" },
  { id: 9, name: "Vapi EV Charge", lat: 20.3893, lng: 72.9106, type: "EV", status: "available", queueTime: 6, city: "Vapi", state: "Gujarat", address: "GIDC, Vapi" },
  { id: 10, name: "Mumbai North CNG", lat: 19.2183, lng: 72.9781, type: "CNG", status: "available", queueTime: 20, city: "Thane", state: "Maharashtra", address: "Ghodbunder Rd, Thane" },

  // Mumbai - Pune - Bangalore - Chennai Route
  { id: 11, name: "Pune EV Plaza", lat: 18.5204, lng: 73.8567, type: "EV", status: "available", queueTime: 5, city: "Pune", state: "Maharashtra", address: "Shivajinagar, Pune" },
  { id: 12, name: "Satara CNG Point", lat: 17.6805, lng: 73.9803, type: "CNG", status: "available", queueTime: 3, city: "Satara", state: "Maharashtra", address: "Highway Exit, Satara" },
  { id: 13, name: "Kolhapur EV Hub", lat: 16.7050, lng: 74.2433, type: "EV", status: "available", queueTime: 7, city: "Kolhapur", state: "Maharashtra", address: "Tarabai Park, Kolhapur" },
  { id: 14, name: "Belgaum CNG Station", lat: 15.8497, lng: 74.4977, type: "CNG", status: "available", queueTime: 4, city: "Belgaum", state: "Karnataka", address: "Khanapur Rd, Belgaum" },
  { id: 15, name: "Hubli EV Charge", lat: 15.3647, lng: 75.1240, type: "EV", status: "available", queueTime: 5, city: "Hubli", state: "Karnataka", address: "Vidyanagar, Hubli" },
  { id: 16, name: "Davangere CNG", lat: 14.4644, lng: 75.9218, type: "CNG", status: "available", queueTime: 2, city: "Davangere", state: "Karnataka", address: "PB Road, Davangere" },
  { id: 17, name: "Tumakuru EV Point", lat: 13.3392, lng: 77.1140, type: "EV", status: "available", queueTime: 8, city: "Tumakuru", state: "Karnataka", address: "Kyatsandra, Tumakuru" },
  { id: 18, name: "Bangalore EV Central", lat: 12.9716, lng: 77.5946, type: "EV", status: "busy", queueTime: 25, city: "Bangalore", state: "Karnataka", address: "MG Road, Bangalore" },
  { id: 19, name: "Hosur CNG Hub", lat: 12.7409, lng: 77.8253, type: "CNG", status: "available", queueTime: 5, city: "Hosur", state: "Tamil Nadu", address: "SIPCOT, Hosur" },
  { id: 20, name: "Vellore EV Station", lat: 12.9165, lng: 79.1325, type: "EV", status: "available", queueTime: 4, city: "Vellore", state: "Tamil Nadu", address: "Katpadi, Vellore" },
  { id: 21, name: "Chennai EV Port", lat: 13.0827, lng: 80.2707, type: "EV", status: "available", queueTime: 10, city: "Chennai", state: "Tamil Nadu", address: "Anna Salai, Chennai" },

  // Hyderabad - Bangalore Route
  { id: 22, name: "Hyderabad EV Hub", lat: 17.3850, lng: 78.4867, type: "EV", status: "available", queueTime: 5, city: "Hyderabad", state: "Telangana", address: "Gachibowli, Hyderabad" },
  { id: 23, name: "Kurnool CNG Point", lat: 15.8281, lng: 78.0373, type: "CNG", status: "available", queueTime: 3, city: "Kurnool", state: "Andhra Pradesh", address: "NH44, Kurnool" },
  { id: 24, name: "Anantapur EV Charge", lat: 14.6819, lng: 77.6006, type: "EV", status: "available", queueTime: 4, city: "Anantapur", state: "Andhra Pradesh", address: "Railway Station Rd, Anantapur" },
  { id: 25, name: "Chikkaballapur CNG", lat: 13.4325, lng: 77.7275, type: "CNG", status: "available", queueTime: 2, city: "Chikkaballapur", state: "Karnataka", address: "Bypass, Chikkaballapur" },

  // Kolkata - Delhi (Grand Trunk Road)
  { id: 26, name: "Kolkata EV Hub", lat: 22.5726, lng: 88.3639, type: "EV", status: "available", queueTime: 10, city: "Kolkata", state: "West Bengal", address: "Salt Lake, Kolkata" },
  { id: 27, name: "Durgapur CNG Station", lat: 23.4807, lng: 87.3119, type: "CNG", status: "available", queueTime: 5, city: "Durgapur", state: "West Bengal", address: "City Centre, Durgapur" },
  { id: 28, name: "Dhanbad EV Point", lat: 23.7957, lng: 86.4304, type: "EV", status: "available", queueTime: 4, city: "Dhanbad", state: "Jharkhand", address: "Bank More, Dhanbad" },
  { id: 29, name: "Varanasi CNG Hub", lat: 25.3176, lng: 82.9739, type: "CNG", status: "busy", queueTime: 18, city: "Varanasi", state: "Uttar Pradesh", address: "Cantt, Varanasi" },
  { id: 30, name: "Prayagraj EV Charge", lat: 25.4358, lng: 81.8463, type: "EV", status: "available", queueTime: 6, city: "Prayagraj", state: "Uttar Pradesh", address: "Civil Lines, Prayagraj" },
  { id: 31, name: "Kanpur CNG Point", lat: 26.4499, lng: 80.3319, type: "CNG", status: "available", queueTime: 8, city: "Kanpur", state: "Uttar Pradesh", address: "GT Road, Kanpur" },
  { id: 32, name: "Agra EV Station", lat: 27.1767, lng: 78.0081, type: "EV", status: "available", queueTime: 12, city: "Agra", state: "Uttar Pradesh", address: "Fatehabad Rd, Agra" },

  // Mumbai - Nagpur Route
  { id: 33, name: "Nashik EV Hub", lat: 19.9975, lng: 73.7898, type: "EV", status: "available", queueTime: 5, city: "Nashik", state: "Maharashtra", address: "College Rd, Nashik" },
  { id: 34, name: "Aurangabad CNG", lat: 19.8762, lng: 75.3433, type: "CNG", status: "available", queueTime: 4, city: "Aurangabad", state: "Maharashtra", address: "Cidco, Aurangabad" },
  { id: 35, name: "Jalna EV Point", lat: 19.8410, lng: 75.8864, type: "EV", status: "available", queueTime: 2, city: "Jalna", state: "Maharashtra", address: "Station Rd, Jalna" },
  { id: 36, name: "Amravati CNG Hub", lat: 20.9320, lng: 77.7523, type: "CNG", status: "available", queueTime: 3, city: "Amravati", state: "Maharashtra", address: "Morshi Rd, Amravati" },
  { id: 37, name: "Nagpur EV Central", lat: 21.1458, lng: 79.0882, type: "EV", status: "available", queueTime: 6, city: "Nagpur", state: "Maharashtra", address: "Civil Lines, Nagpur" },

  // South Coastal Route
  { id: 38, name: "Kochi EV Hub", lat: 9.9312, lng: 76.2673, type: "EV", status: "available", queueTime: 5, city: "Kochi", state: "Kerala", address: "MG Road, Kochi" },
  { id: 39, name: "Trivandrum CNG", lat: 8.5241, lng: 76.9366, type: "CNG", status: "available", queueTime: 4, city: "Trivandrum", state: "Kerala", address: "East Fort, Trivandrum" },
  { id: 40, name: "Madurai EV Point", lat: 9.9252, lng: 78.1198, type: "EV", status: "available", queueTime: 3, city: "Madurai", state: "Tamil Nadu", address: "Anna Nagar, Madurai" },
  { id: 41, name: "Coimbatore CNG Hub", lat: 11.0168, lng: 76.9558, type: "CNG", status: "available", queueTime: 5, city: "Coimbatore", state: "Tamil Nadu", address: "Avinashi Rd, Coimbatore" },

  // Central India
  { id: 42, name: "Bhopal EV Station", lat: 23.2599, lng: 77.4126, type: "EV", status: "available", queueTime: 4, city: "Bhopal", state: "Madhya Pradesh", address: "MP Nagar, Bhopal" },
  { id: 43, name: "Indore CNG Point", lat: 22.7196, lng: 75.8577, type: "CNG", status: "available", queueTime: 6, city: "Indore", state: "Madhya Pradesh", address: "Vijay Nagar, Indore" },
  { id: 44, name: "Gwalior EV Charge", lat: 26.2183, lng: 78.1828, type: "EV", status: "available", queueTime: 3, city: "Gwalior", state: "Madhya Pradesh", address: "City Centre, Gwalior" },
  { id: 45, name: "Jabalpur CNG Hub", lat: 23.1815, lng: 79.9864, type: "CNG", status: "available", queueTime: 2, city: "Jabalpur", state: "Madhya Pradesh", address: "Civil Lines, Jabalpur" },

  // North India
  { id: 46, name: "Chandigarh EV Hub", lat: 30.7333, lng: 76.7794, type: "EV", status: "available", queueTime: 5, city: "Chandigarh", state: "Chandigarh", address: "Sector 17, Chandigarh" },
  { id: 47, name: "Ludhiana CNG Point", lat: 30.9010, lng: 75.8573, type: "CNG", status: "available", queueTime: 8, city: "Ludhiana", state: "Punjab", address: "Ferozepur Rd, Ludhiana" },
  { id: 48, name: "Amritsar EV Station", lat: 31.6340, lng: 74.8723, type: "EV", status: "available", queueTime: 4, city: "Amritsar", state: "Punjab", address: "Golden Temple Rd, Amritsar" },
  { id: 49, name: "Jammu CNG Hub", lat: 32.7266, lng: 74.8570, type: "CNG", status: "available", queueTime: 3, city: "Jammu", state: "J&K", address: "Gandhi Nagar, Jammu" },
  { id: 50, name: "Shimla EV Point", lat: 31.1048, lng: 77.1734, type: "EV", status: "available", queueTime: 2, city: "Shimla", state: "Himachal Pradesh", address: "Mall Road, Shimla" },
  
  // Additional for Mumbai - Pune - Solapur - Hyderabad (Requested in previous turns)
  { id: 51, name: "Lonavala EV Hub", lat: 18.7481, lng: 73.4072, type: "EV", status: "available", queueTime: 10, city: "Lonavala", state: "Maharashtra", address: "Expressway Exit, Lonavala" },
  { id: 52, name: "Solapur CNG Station", lat: 17.6599, lng: 75.9064, type: "CNG", status: "available", queueTime: 5, city: "Solapur", state: "Maharashtra", address: "Solapur Bypass" },
  { id: 53, name: "Latur EV Plaza", lat: 18.4088, lng: 76.5604, type: "EV", status: "available", queueTime: 4, city: "Latur", state: "Maharashtra", address: "Main Market, Latur" }
];

