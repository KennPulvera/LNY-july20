import React, { useState, useMemo } from 'react';

const OtherBranchesSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');

  const branches = useMemo(() => [
    {
      id: 1,
      name: "Naga City Branch",
      city: "Naga City",
      shortAddress: "Unit 08 Olivan Bldg. & Del Rosario",
      fullAddress: "🏢 Main Branch: Unit 08 Olivan Bldg. # 76 Tinago, Blumentritt St., Naga City. Sa may orange dormitel po Beside lovely rafa resto\n\n📡 Satellite Branch: Blk 5 lot 26 Insular St Dona Conchita Subdivision Del Rosario Naga near Vista Mall Front Bongat Law",
      phone: "09931401200 / 09910638641",
      email: "lanceyurikidsspot@gmail.com",
      distance: "0 km",
      status: "open",
      hours: "Mon: 8:00 AM - 5:00 PM\nTue-Sat: 9:00 AM - 5:00 PM\nSun: CLOSED",
      icon: "fa-map-marker-alt"
    },
    {
      id: 2,
      name: "Legazpi Branch",
      city: "Legazpi",
      shortAddress: "Shorehomes Apartment, Rawis",
      fullAddress: "Door 5 Shorehomes, Rawis, Legazpi City. Infront of LTRFB. Sa may Angels Burger po papasok, katabi po ng Cafe Rustico",
      phone: "639934371193",
      distance: "5.2 km",
      status: "open",
      hours: "8:00 AM - 8:00 PM",
      icon: "fa-map-marker-alt"
    },
    {
      id: 3,
      name: "Daet Branch", 
      city: "Daet",
      shortAddress: "Ace and Jaja Building, Bagasbas",
      fullAddress: "Ace and Jaja Building, Bagasbas Rd, Barangay VI, Daet Camarines Norte",
      phone: "0992-4460-263",
      distance: "12.8 km",
      status: "open",
      hours: "8:00 AM - 8:00 PM",
      icon: "fa-map-marker-alt"
    },
    {
      id: 4,
      name: "Guinobatan Branch",
      city: "Guinobatan",
      shortAddress: "Paterno St, Calzada",
      fullAddress: "Door B Paterno St Calzada Guinobatan Albay. Near Usurman trading Beside Guinobatan west central school",
      phone: "09456970557",
      distance: "8.5 km",
      status: "open",
      hours: "8:00 AM - 8:00 PM",
      icon: "fa-map-marker-alt"
    },
    {
      id: 5,
      name: "Polangui Branch",
      city: "Polangui",
      shortAddress: "Centro Occidental",
      fullAddress: "Purok Mars Centro Occidental Alpapara&Liria Blg. Infront of Lila Restaurante 2nd Floor Door D - Alpapara&Liria Blg.",
      phone: "09912306541",
      distance: "15.3 km",
      status: "open",
      hours: "8:00 AM - 8:00 PM",
      icon: "fa-map-marker-alt"
    },
    {
      id: 6,
      name: "Daraga Branch",
      city: "Daraga",
      shortAddress: "Purok 2, Rizal Street",
      fullAddress: "Purok 2, Rizal Street Sagpon Daraga Albay. Amelia Building 2nd floor Room 2. Landmark: Beside United Institute (UI Bldg) New Bldg.2nd floor. Room 2",
      phone: "09910716065",
      distance: "6.7 km",
      status: "open",
      hours: "8:00 AM - 8:00 PM",
      icon: "fa-map-marker-alt"
    },
    {
      id: 7,
      name: "Tabaco Branch",
      city: "Tabaco",
      shortAddress: "Zone 3 Panal",
      fullAddress: "Purok 3 Panal Tabaco katapat po ng goyena compound old malapit sa polytechnic institute of tabaco color blue po na bahay",
      phone: "09912614563",
      distance: "22.1 km",
      status: "open",
      hours: "8:00 AM - 8:00 PM",
      icon: "fa-map-marker-alt"
    },
    {
      id: 8,
      name: "Sorsogon Branch",
      city: "Sorsogon",
      shortAddress: "346 West District Tugos",
      fullAddress: "346 West District Tugos Sorsogon City near elat car wash/katapat ng big mak burger",
      phone: "09922593967",
      distance: "45.2 km",
      status: "open",
      hours: "8:00 AM - 8:00 PM",
      icon: "fa-map-marker-alt"
    },
    {
      id: 9,
      name: "Iriga Branch",
      city: "Iriga",
      shortAddress: "APEM-DG Apartment, Zone 4",
      fullAddress: "DOOR 2 APEM -DG Apartment zone 4 San isidro iriga city 4431 beside PCA sa unahan ng Casureco",
      phone: "09770279122",
      distance: "18.9 km",
      status: "open",
      hours: "8:00 AM - 8:00 PM",
      icon: "fa-map-marker-alt"
    },
    {
      id: 10,
      name: "Catanduanes Branch",
      city: "Virac",
      shortAddress: "218 TIAD St. GOGON Centro",
      fullAddress: "218 TIAD St. GOGON Centro, Virac Catanduanes. Landmark: Crystal ARC WATER REFILLING STATION WHITE AND GRAY PAINTED GATE; alongside San Rafael Church (Gogon church) in between Evangelista clinic and Laundry SHOP",
      phone: "09285744003",
      distance: "85.4 km",
      status: "open",
      hours: "8:00 AM - 8:00 PM",
      icon: "fa-map-marker-alt"
    }
  ], []);

  const cities = useMemo(() => {
    const uniqueCities = [...new Set(branches.map(branch => branch.city))];
    return uniqueCities.sort();
  }, [branches]);

  const filteredBranches = useMemo(() => {
    return branches.filter(branch => {
      const matchesSearch = branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           branch.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           branch.shortAddress.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCity = selectedCity === 'all' || branch.city === selectedCity;
      return matchesSearch && matchesCity;
    });
  }, [searchTerm, selectedCity, branches]);



  return (
    <section className="other-branches" id="branches">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            <span className="sparkle">✨</span>
            Branches
            <span className="sparkle">✨</span>
          </h2>
          <p className="section-subtitle">
            Find us in these locations across the region
          </p>
        </div>

        {/* Enhanced Search and Filter Controls */}
        <div className="branches-controls">
          <div className="search-control">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search by branch name, city, or area..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="branch-search-input"
            />
            {searchTerm && (
              <button 
                className="clear-search"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
          
          <div className="filter-control">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="city-filter-select"
            >
              <option value="all">All Cities</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="search-results-info">
          <span className="results-count">
            {filteredBranches.length} {filteredBranches.length === 1 ? 'branch' : 'branches'} found
          </span>
          {searchTerm && (
            <span className="search-term">for "{searchTerm}"</span>
          )}
        </div>
        
        <div className="branches-grid">
          {filteredBranches.map((branch) => (
            <div key={branch.id} className="magic-branch-card">
              <div className="branch-header">
                <div className="branch-icon">
                  <i className={`fas ${branch.icon}`}></i>
                </div>
                <div className="branch-status-badges">
                  <span className="distance-badge">
                    <i className="fas fa-route"></i>
                    {branch.distance}
                  </span>
                </div>
              </div>

              <div className="branch-info">
                <h3 className="branch-name">{branch.name}</h3>
                
                <div className="branch-details">
                  <p className="branch-address">
                    <i className="fas fa-map-marker-alt"></i>
                    <span className="address-text">
                      <strong>{branch.shortAddress}</strong>
                      <small className="full-address">{branch.fullAddress}</small>
                    </span>
                  </p>
                  
                  <p className="branch-hours">
                    <i className="fas fa-clock"></i>
                    {branch.hours}
                  </p>
                  
                  {branch.phone && (
                    <p className="branch-phone">
                      <i className="fas fa-phone"></i>
                      <a href={`tel:${branch.phone}`} className="phone-link">
                        {branch.phone}
                      </a>
                    </p>
                  )}
                </div>


              </div>

              <div className="branch-sparkles">
                <span className="sparkle">🏢</span>
                <span className="sparkle">📍</span>
              </div>
            </div>
          ))}
        </div>

        {filteredBranches.length === 0 && (
          <div className="no-results">
            <div className="no-results-content">
              <i className="fas fa-search"></i>
              <h3>No branches found</h3>
              <p>Try adjusting your search terms or filter settings</p>
              <button 
                className="reset-filters-btn"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCity('all');
                }}
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default OtherBranchesSection; 