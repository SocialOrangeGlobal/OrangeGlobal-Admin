export const countries = [
  "Australia", "Canada", "India", "Ireland", "Malaysia", "New Zealand", "Philippines", "Singapore", "South Africa", "United Kingdom", "United States", "United Arab Emirates",
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
  "Cabo Verde", "Cambodia", "Cameroon", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
  "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
  "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guyana",
  "Haiti", "Honduras", "Hungary",
  "Iceland", "Indonesia", "Iran", "Iraq", "Italy", "Ivory Coast",
  "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Maldives", "Mali", "Malta", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway",
  "Oman",
  "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Poland", "Portugal",
  "Qatar",
  "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent", "Samoa", "San Marino", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "Uruguay", "Uzbekistan",
  "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
  "Yemen",
  "Zambia", "Zimbabwe"
];

export const nationalities = [
  "Afghan", "Albanian", "Algerian", "American", "Andorran", "Angolan", "Antiguan", "Argentine", "Armenian", "Australian", "Austrian", "Azerbaijani",
  "Bahamian", "Bahraini", "Bangladeshi", "Barbadian", "Belarussian", "Belgian", "Belizean", "Beninese", "Bhutanese", "Bolivian", "Bosnian", "Botswanan", "Brazilian", "British", "Bruneian", "Bulgarian", "Burkinese", "Burundian",
  "Cambodian", "Cameroonian", "Canadian", "Cape Verdean", "Central African", "Chadian", "Chilean", "Chinese", "Colombian", "Comoran", "Congolese", "Costa Rican", "Croatian", "Cuban", "Cypriot", "Czech",
  "Danish", "Djiboutian", "Dominican", "Dutch", "East Timorese", "Ecuadorian", "Egyptian", "Emirati", "Equatorial Guinean", "Eritrean", "Estonian", "Ethiopian",
  "Fijian", "Filipino", "Finnish", "French",
  "Gabonese", "Gambian", "Georgian", "German", "Ghanaian", "Greek", "Grenadian", "Guatemalan", "Guinean", "Guyanese",
  "Haitian", "Honduran", "Hungarian",
  "Icelandic", "Indian", "Indonesian", "Iranian", "Iraqi", "Irish", "Israeli", "Italian", "Ivorian",
  "Jamaican", "Japanese", "Jordanian",
  "Kazakhstani", "Kenyan", "Kiribati", "Kuwaiti", "Kyrgyzstani",
  "Laotian", "Latvian", "Lebanese", "Liberian", "Libyan", "Liechtensteiner", "Lithuanian", "Luxembourger",
  "Macedonian", "Malagasy", "Malawian", "Malaysian", "Maldivian", "Malian", "Maltese", "Mauritanian", "Mauritian", "Mexican", "Micronesian", "Moldovan", "Monacan", "Mongolian", "Montenegrin", "Moroccan", "Mozambican", "Burmese",
  "Namibian", "Nauruan", "Nepalese", "New Zealander", "Nicaraguan", "Nigerian", "Nigerien", "North Korean", "Norwegian",
  "Omani",
  "Pakistani", "Palauan", "Palestinian", "Panamanian", "Papua New Guinean", "Paraguayan", "Peruvian", "Polish", "Portuguese",
  "Qatari",
  "Romanian", "Russian", "Rwandan",
  "Saint Lucian", "Salvadoran", "Samoan", "San Marinese", "Sao Tomean", "Saudi", "Senegalese", "Serbian", "Seychellois", "Sierra Leonean", "Singaporean", "Slovak", "Slovenian", "Solomon Islander", "Somali", "South African", "South Korean", "Spanish", "Sri Lankan", "Sudanese", "Surinamese", "Swazi", "Swedish", "Swiss", "Syrian",
  "Taiwanese", "Tajik", "Tanzanian", "Thai", "Togolese", "Tongan", "Trinidadian", "Tunisian", "Turkish", "Turkmen", "Tuvaluan",
  "Ugandan", "Ukrainian", "Uruguayan", "Uzbek",
  "Vanuatuan", "Venezuelan", "Vietnamese",
  "Welsh",
  "Yemeni",
  "Zambian", "Zimbabwean"
];

export const genders = ["Male", "Female", "Other", "Prefer not to say"];
export const opportunityTypes = ["Full-Time Onsite", "Remote", "Hybrid", "Contract / Project-Based"];
export const highestQualifications = ["High School / Diploma", "Bachelor's Degree", "Master's Degree", "PhD / Doctorate", "Professional Certification"];
export const englishTests = ["IELTS", "TOEFL", "PTE", "OET", "None / English is Native Language"];
export const relocationFamilyStatuses = ["Alone", "With Partner", "With Family (Partner & Children)"];
export const yesNoOptions = ["Yes", "No"];
export const positionTypes = [
  { label: "Full-Time", value: "full-time" },
  { label: "Contract", value: "contract" },
  { label: "Remote", value: "remote" }
];

/** country → state/region → cities */
export const countryStateCity: Record<string, Record<string, string[]>> = {
  "Australia": {
    "New South Wales": ["Sydney", "Newcastle", "Wollongong", "Central Coast", "Maitland", "Coffs Harbour", "Wagga Wagga", "Albury", "Port Macquarie", "Tamworth", "Orange", "Dubbo", "Bathurst"],
    "Victoria": ["Melbourne", "Geelong", "Ballarat", "Bendigo", "Shepparton", "Latrobe Valley", "Wodonga", "Mildura", "Warrnambool", "Horsham"],
    "Queensland": ["Brisbane", "Gold Coast", "Townsville", "Cairns", "Toowoomba", "Mackay", "Rockhampton", "Sunshine Coast", "Bundaberg", "Hervey Bay"],
    "South Australia": ["Adelaide", "Mount Gambier", "Whyalla", "Murray Bridge", "Port Augusta", "Port Lincoln", "Port Pirie", "Victor Harbor"],
    "Western Australia": ["Perth", "Fremantle", "Mandurah", "Bunbury", "Geraldton", "Albany", "Kalgoorlie", "Broome", "Karratha"],
    "Tasmania": ["Hobart", "Launceston", "Devonport", "Burnie", "Ulverstone", "Queenstown"],
    "Northern Territory": ["Darwin", "Alice Springs", "Katherine", "Nhulunbuy", "Tennant Creek", "Palmerston"],
    "Australian Capital Territory": ["Canberra", "Queanbeyan", "Tuggeranong", "Belconnen", "Gungahlin"]
  },
  "India": {
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Solapur", "Thane", "Navi Mumbai", "Kolhapur", "Sangli"],
    "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum", "Gulbarga", "Davanagere", "Bellary", "Shimoga"],
    "Delhi": ["New Delhi", "Dwarka", "Rohini", "Saket", "Karol Bagh", "Connaught Place", "Noida Extension"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Tiruppur", "Vellore", "Erode"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhinagar", "Anand"],
    "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Bardhaman", "Malda"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner", "Alwar", "Bharatpur"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Allahabad", "Meerut", "Ghaziabad", "Noida", "Firozabad"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar", "Ramagundam", "Secunderabad"],
    "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Palakkad", "Alappuzha", "Kannur"],
    "Punjab": ["Chandigarh", "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali"],
    "Haryana": ["Gurugram", "Faridabad", "Ambala", "Panipat", "Hisar", "Rohtak", "Sonipat"]
  },
  "United Kingdom": {
    "England": ["London", "Manchester", "Birmingham", "Leeds", "Sheffield", "Bristol", "Newcastle", "Liverpool", "Leicester", "Nottingham", "Coventry", "Bradford"],
    "Scotland": ["Edinburgh", "Glasgow", "Aberdeen", "Dundee", "Inverness", "Stirling", "Perth", "East Kilbride"],
    "Wales": ["Cardiff", "Swansea", "Newport", "Wrexham", "Barry", "Neath", "Cwmbran"],
    "Northern Ireland": ["Belfast", "Derry", "Lisburn", "Newry", "Armagh", "Ballymena", "Coleraine"]
  },
  "United States": {
    "California": ["Los Angeles", "San Francisco", "San Diego", "San Jose", "Sacramento", "Oakland", "Fresno", "Long Beach", "Bakersfield", "Anaheim", "Santa Ana"],
    "Texas": ["Houston", "San Antonio", "Dallas", "Austin", "Fort Worth", "El Paso", "Arlington", "Corpus Christi", "Plano", "Lubbock"],
    "New York": ["New York City", "Buffalo", "Rochester", "Yonkers", "Syracuse", "Albany", "New Rochelle", "Mount Vernon", "Schenectady"],
    "Florida": ["Miami", "Orlando", "Tampa", "Jacksonville", "St. Petersburg", "Hialeah", "Tallahassee", "Fort Lauderdale", "Cape Coral"],
    "Illinois": ["Chicago", "Aurora", "Naperville", "Joliet", "Rockford", "Springfield", "Elgin", "Peoria", "Champaign"],
    "Washington": ["Seattle", "Spokane", "Tacoma", "Vancouver", "Bellevue", "Kent", "Renton", "Kirkland"],
    "Arizona": ["Phoenix", "Tucson", "Mesa", "Chandler", "Scottsdale", "Glendale", "Gilbert", "Tempe"],
    "Georgia": ["Atlanta", "Columbus", "Augusta", "Savannah", "Athens", "Sandy Springs", "Roswell", "Macon"],
    "North Carolina": ["Charlotte", "Raleigh", "Greensboro", "Durham", "Winston-Salem", "Fayetteville", "Cary"],
    "Michigan": ["Detroit", "Grand Rapids", "Warren", "Sterling Heights", "Ann Arbor", "Lansing", "Flint"]
  },
  "Canada": {
    "Ontario": ["Toronto", "Ottawa", "Mississauga", "Brampton", "Hamilton", "London", "Markham", "Vaughan", "Kitchener", "Windsor"],
    "British Columbia": ["Vancouver", "Victoria", "Surrey", "Burnaby", "Richmond", "Abbotsford", "Kelowna", "Coquitlam", "Nanaimo"],
    "Alberta": ["Calgary", "Edmonton", "Red Deer", "Lethbridge", "St. Albert", "Medicine Hat", "Grande Prairie", "Airdrie"],
    "Quebec": ["Montreal", "Quebec City", "Laval", "Gatineau", "Longueuil", "Sherbrooke", "Saguenay", "Trois-Rivieres"],
    "Manitoba": ["Winnipeg", "Brandon", "Steinbach", "Thompson", "Portage la Prairie"],
    "Saskatchewan": ["Saskatoon", "Regina", "Prince Albert", "Moose Jaw", "Swift Current"]
  },
  "Philippines": {
    "Metro Manila": ["Manila", "Quezon City", "Makati", "Pasig", "Taguig", "Parañaque", "Pasay", "Mandaluyong", "Marikina", "Caloocan"],
    "Cebu": ["Cebu City", "Mandaue", "Lapu-Lapu", "Talisay", "Danao", "Carcar", "Toledo"],
    "Davao": ["Davao City", "Digos", "Panabo", "Tagum", "Samal"],
    "Rizal": ["Antipolo", "Cainta", "Taytay", "Angono", "Binangonan"],
    "Bulacan": ["Malolos", "Meycauayan", "San Jose del Monte", "Baliuag", "Plaridel"],
    "Laguna": ["Calamba", "San Pablo", "Santa Rosa", "Biñan", "San Pedro"]
  },
  "United Arab Emirates": {
    "Dubai": ["Downtown Dubai", "Deira", "Bur Dubai", "Jumeirah", "Al Quoz", "Al Barsha", "Jebel Ali", "Business Bay", "Dubai Marina"],
    "Abu Dhabi": ["Abu Dhabi City", "Al Ain", "Khalifa City", "Musaffah", "Al Reem Island"],
    "Sharjah": ["Sharjah City", "Khor Fakkan", "Dibba Al Hisn", "Kalba"],
    "Ajman": ["Ajman City"],
    "Ras Al Khaimah": ["Ras Al Khaimah City", "Al Hamra", "Khuzam"],
    "Fujairah": ["Fujairah City", "Dibba Al Fujairah", "Khor Fakkan"],
    "Umm Al Quwain": ["Umm Al Quwain City"]
  },
  "Singapore": {
    "Central": ["Buona Vista", "Clementi", "Holland Village", "Kent Ridge", "Queenstown", "Tiong Bahru", "Toa Payoh", "Orchard"],
    "East": ["Bedok", "Changi", "Pasir Ris", "Tampines", "Simei"],
    "North": ["Sembawang", "Woodlands", "Yishun", "Mandai", "Admiralty"],
    "North-East": ["Ang Mo Kio", "Bishan", "Hougang", "Punggol", "Sengkang", "Serangoon"],
    "West": ["Boon Lay", "Bukit Batok", "Bukit Panjang", "Choa Chu Kang", "Jurong East", "Jurong West", "Tengah"]
  },
  "Malaysia": {
    "Selangor": ["Petaling Jaya", "Shah Alam", "Subang Jaya", "Klang", "Ampang", "Cheras", "Sepang", "Rawang"],
    "Kuala Lumpur": ["Bukit Bintang", "Chow Kit", "KLCC", "Bangsar", "Mont Kiara", "Desa Park City", "Wangsa Maju", "Kepong"],
    "Penang": ["Georgetown", "Butterworth", "Bayan Lepas", "Seberang Jaya", "Bukit Mertajam"],
    "Johor": ["Johor Bahru", "Skudai", "Pasir Gudang", "Batu Pahat", "Muar", "Kluang"],
    "Perak": ["Ipoh", "Taiping", "Teluk Intan", "Sitiawan", "Batu Gajah"],
    "Sabah": ["Kota Kinabalu", "Sandakan", "Tawau", "Lahad Datu", "Keningau"],
    "Sarawak": ["Kuching", "Miri", "Sibu", "Bintulu", "Limbang"],
    "Negeri Sembilan": ["Seremban", "Port Dickson", "Nilai", "Bahau", "Tampin"]
  },
  "New Zealand": {
    "Auckland": ["Auckland City", "North Shore", "Waitakere", "Manukau", "Papakura", "Henderson", "Botany Downs"],
    "Wellington": ["Wellington City", "Lower Hutt", "Upper Hutt", "Porirua", "Kapiti Coast"],
    "Canterbury": ["Christchurch", "Selwyn", "Waimakariri", "Rangiora", "Kaikōura"],
    "Waikato": ["Hamilton", "Cambridge", "Te Awamutu", "Tokoroa", "Ngaruawahia"],
    "Bay of Plenty": ["Tauranga", "Rotorua", "Whakatane", "Kawerau", "Opotiki"],
    "Otago": ["Dunedin", "Queenstown", "Central Otago", "Cromwell", "Alexandra"]
  },
  "South Africa": {
    "Gauteng": ["Johannesburg", "Pretoria", "Ekurhuleni", "Soweto", "Midrand", "Sandton", "Centurion", "Tembisa"],
    "Western Cape": ["Cape Town", "Stellenbosch", "George", "Paarl", "Worcester", "Mossel Bay", "Knysna"],
    "KwaZulu-Natal": ["Durban", "Pietermaritzburg", "Richards Bay", "Newcastle", "Empangeni"],
    "Eastern Cape": ["Port Elizabeth", "East London", "Mthatha", "Bhisho", "King Williams Town"],
    "Limpopo": ["Polokwane", "Tzaneen", "Phalaborwa", "Mokopane", "Louis Trichardt"],
    "Mpumalanga": ["Nelspruit", "Witbank", "Secunda", "Standerton", "Middelburg"]
  },
  "Pakistan": {
    "Punjab": ["Lahore", "Faisalabad", "Rawalpindi", "Gujranwala", "Multan", "Sialkot", "Bahawalpur", "Sargodha", "Sheikhupura"],
    "Sindh": ["Karachi", "Hyderabad", "Sukkur", "Larkana", "Nawabshah", "Khairpur"],
    "Khyber Pakhtunkhwa": ["Peshawar", "Abbottabad", "Mardan", "Mingora", "Kohat", "Dera Ismail Khan"],
    "Balochistan": ["Quetta", "Turbat", "Khuzdar", "Hub", "Chaman"],
    "Islamabad Capital Territory": ["Islamabad"]
  },
  "Sri Lanka": {
    "Western Province": ["Colombo", "Sri Jayawardenepura Kotte", "Gampaha", "Kalutara", "Negombo", "Kelaniya"],
    "Central Province": ["Kandy", "Matale", "Nuwara Eliya", "Dambulla"],
    "Southern Province": ["Galle", "Matara", "Hambantota", "Tangalle"],
    "Northern Province": ["Jaffna", "Vavuniya", "Mannar", "Kilinochchi"],
    "Eastern Province": ["Trincomalee", "Batticaloa", "Ampara", "Kalmunai"]
  }
};
