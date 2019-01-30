// Render the PayPal button
paypal.Button.render({
  // Set your environment
  env: 'sandbox', // sandbox | production
  
  // Specify the style of the button
  style: {
    layout: 'vertical',  // horizontal | vertical
    size:   'medium',    // medium | large | responsive
    shape:  'rect',      // pill | rect
    color:  'gold'       // gold | blue | silver | white | black
  },
  
  // Specify allowed and disallowed funding sources
  //
  // Options:
  // - paypal.FUNDING.CARD
  // - paypal.FUNDING.CREDIT
  // - paypal.FUNDING.ELV
  funding: {
    allowed: [
      paypal.FUNDING.CARD,
      paypal.FUNDING.CREDIT
    ],
    disallowed: []
  },
  
  // Enable Pay Now checkout flow (optional)
  commit: true,
  
  // PayPal Client IDs - replace with your own
  // Create a PayPal app: https://developer.paypal.com/developer/applications/create
  client: {
    sandbox: 'Afpe0-1Q3W1N-qRcIUF_9YyJ7iQXEq9R0_ukkN3Spc_eXoQ9NofkK1h0NAem9rWYUi-cLtOae3iv-r2W'
    // production: '<insert production client id>'
  },
  
  payment: function (data, actions) {
    const price = document.querySelector('.tour-price')
    const paymentPrice = parseInt(price.innerText, 10)
    return actions.payment.create({
      payment: {
        transactions: [
          {
            amount: {
              total: paymentPrice,
              currency: 'USD'
            }
          }
        ]
      }
    });
  },
  
  onAuthorize: function (data, actions) {
    
    return actions.payment.execute()
      .then(function () {
        const clientId = 'CLIENT_ID';
        const apiKey = 'API_KEY';
        const scopes = 'https://www.googleapis.com/auth/calendar';
        
        // Authorize owner's Google Calendar
        handleAuth();    
  
        function handleClientLoad() {
          gapi.client.setApiKey(apiKey);
          window.setTimeout(checkAuth,1);
          checkAuth();
        }
  
        function checkAuth() {
          gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true},
              handleAuthResult);
        }
  
        function handleAuthResult(authResult) {
          if (authResult) {
            createCalendarEvent(data);
          } else {
            alert('Event not generated')
          }
        }
  
        function handleAuth(event) {
          gapi.auth.authorize(
              {client_id: clientId, scope: scopes, immediate: true},
              handleAuthResult);
          return false;
        }
        
        function createCalendarEvent(data) {
          gapi.client.load('calendar', 'v3', function() {
            const buyer = getFormInputInfo()            
            const tour = purchasedTourInfo()
            const orderNumber = data.orderID
  
// Email markup for letter to send with Google calendar invite to buyer
const emailMarkup = `
Dear ${buyer.firstName} ${buyer.lastName},

Thank you for choosing to book your adventures with Ocean Tigers Dive House.

<h3>Tour Information:</h3> 
<b>Tour:</b> ${tour.title}
<b>Summary:</b> ${tour.description}
<b>Tour Dates:</b> ${buyer.date}
<b>Tour Price:</b> ${tour.price}
<b>Order No.:</b> ${orderNumber}

<h3>Your Information:</h3>
<b>Name:</b> ${buyer.firstName} ${buyer.lastName}
<b>Address:</b> ${buyer.street} 
              ${buyer.city}, ${buyer.state} ${buyer.zip}, ${buyer.country}
<b>Email:</b> ${buyer.email}
<b>Phone:</b> ${buyer.phone}

Please review the information above and if anything is incorrect, or if you have any additional questions, please email us at oceantigersdivehouse@gmail.com.  

We look forward to joining you in this incredible adventure.

Sincerely,

The Ocean Tigers Dive House Staff
`;
  
            const event = {
              // 'id': eventID, // Will be automaticall generated
              'summary': `${tour.title}, ${orderNumber}`,
              'location': tour.location,
              'description': emailMarkup,
              'start': {
                'date': buyer.date,
                'timeZone': 'America/Los_Angeles'
              },
              'end': {
                'date': buyer.date,
                'timeZone': 'America/Los_Angeles'
              },
              'attendees': [
                {'email': buyer.email}
              ]
            };
            
            const request = gapi.client.calendar.events.insert({
              'calendarId': 'primary',
              'sendNotifications': true,
              'sendUpdates': 'all',
              'resource': event
            });
            
            request.execute(function(event) {
              console.log(event)
            });
          });
        }
        hideCheckout()
        showCards()
      });
    }
  }, '#paypal-button-container')
  
  const cardsDiv = document.getElementById('tour-cards')
  const cardsHeader = document.getElementById('tour-cards-title')
  const checkoutForm = document.querySelectorAll('.checkout')
  const contactForm = document.querySelector('.contact-form')
  const contactSubmit = document.getElementById('submit-contact-info')
  const tourTitle = document.querySelectorAll('.tour-title')
  const tourDescription = document.querySelectorAll('.tour-description')
  const tourLocation = document.querySelectorAll('.tour-location')
  const tourPrice = document.querySelectorAll('.tour-price')

  function hideContactForm() { contactForm.style.display = 'none' }

  function showContactForm() { contactForm.style.display = 'block' }

  function getFormInputInfo() {
    const myForm = $("form").serializeArray()
    const data = {}
      $.each(myForm, function(i, field){ data[field.name] = field.value })
      return data
  }

  function purchasedTourInfo() {
    return {
      price:  parseFloat(tourPrice[0].innerText),
      description: tourDescription[0].innerText,
      title: tourTitle[0].innerText,
      location: tourLocation[0].innerText
    } 
  }

  function showCards() {
    cardsDiv.style.display = 'flex'
    cardsHeader.style.display = 'block'
  }
  
  function populateCards(packages) {
    packages.forEach(p => {
      const markup = `
        <div class="col-lg-4 col-md-6 mt-3">
          <div class="card mb-3 h-100" id="tourCards">
            <img src="${p.imageUrl}" class="card-img-top" alt="${p.name}">
            <h5 class="card-header tour pl-4 pr-4 pt-2 pb-2 bg-warning border-dark" data-id="title" id="card-tour-name">${p.name}</h5>
            <div class="card-body">
              <p class="card-text tour" data-id="description" id="card-tour-description">${p.description}</p>
              <p class="card-text tour" data-id="location" id="card-tour-location">${p.location}</p>
              <p class="card-text">$ <span class="tour" data-id="price" id="card-tour-price">${parseFloat(p.price)}</span> USD</p>
            </div>
            <div class="p-4">
                <a href="#" class="btn btn-warning purchase-tour border-dark" id="purchase-tour">Buy Now</a>
            </div>
          </div>
        </div>
        `
        cardsDiv.innerHTML += markup;
    })
  }
  
  function hideCheckout() { checkoutForm.forEach(el => el.style.display = 'none') }
  
  function displayCheckout() { checkoutForm.forEach(el => el.style.display = 'block') }
  
  function hidePackages() {
    cardsDiv.style.display = 'none'
    cardsHeader.style.display = 'none'
  }
  
  // Listen for Buy Now click event
  cardsDiv.addEventListener('click', getChosenTourInfo) 

  function addTourToCheckout(tour) {
    tourTitle.forEach(el => el.innerText = tour.title)
    tourDescription.forEach(el => el.innerText = tour.description)
    tourLocation.forEach(el => el.innerText = tour.location)
    tourPrice.forEach(el => el.innerText = tour.price)
  }
  
  function getChosenTourInfo(e) {
    // Target card and see if there's a buy now button and then target the classes for their values???
    if(e.target.classList.contains('purchase-tour')) {
      const data = (event.target).closest('#tourCards').querySelectorAll('.tour')
      let chosenTour = {}
      data.forEach(el => chosenTour[el.dataset.id] = el.innerText )
      hidePackages()
      showContactForm(chosenTour)
      addTourToCheckout(chosenTour)
    }
    e.preventDefault()
  }

  function addCustomerToCheckout() {
    const customer = document.querySelector('.customer-info')
    const date = document.querySelector('.tour-date')
    const buyer = getFormInputInfo()
    const convertedDate = convertDate(buyer.date)

    const markup = `
      <h4 class="m-0 mt-3 mb-3 text-underline">Contact Information:</h4>
      <p class="m-0"><span class="customer-first-name">${buyer.firstName}</span>&nbsp;<span class="customer-last-name">${buyer.lastName}</span></p>
      <p class="m-0"><span class="customer-street">${buyer.street}</span></p>
      <p class="m-0"><span class="customer-city">${buyer.city}</span>&nbsp;<span class="customer-state">asdfasd</span>&nbsp;<span class="customer-zip">sdafdsf</span>,&nbsp;<span class="customer-country">asfas</span></p>
      <p class="m-0"><span class="customer-email">${buyer.email}</span></p>
      <p class="m-0 mb-3"><span class="customer-phone">${buyer.phone}</span></p>
    `;

    console.log(date)
    customer.innerHTML = markup
    date.innerText = convertedDate
    console.log(buyer)
  }
  
  function checkOut(){
    addCustomerToCheckout()
    hideContactForm()
    displayCheckout()
  } 

  $("#buyer-form").submit(function(e){ e.preventDefault(); });
  
  function getPackages() {
    const token = 'DATO_CMS_TOKEN';
     // Fetch packages from DatoCMS
     fetch(
      'https://graphql.datocms.com/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            {
              allPackages() {
                name
                location
                price
                description
                imageUrl
              }
            }
          `
        }),
      }
    )
    .then(res => res.json())
    .then((res) => {
      const packages = res.data.allPackages;
      populateCards(packages)
    })
    .catch((error) => {
      console.log(error);
    });
  }

  function convertDate(date) {
    const months = {
      '01' : 'January',
      '02' : 'February',
      '03' : 'March',
      '04' : 'April',
      '05' : 'May',
      '06' : 'June',
      '07' : 'July',
      '08' : 'August',
      '09' : 'September',
      '10' : 'October',
      '11' : 'November',
      '12' : 'December'
  }
    const dateArr = date.split('-')
    const year = dateArr[0]
    const day = dateArr[2]
    const monthIndex = dateArr[1]
    const month = months[monthIndex]
    return `${month} ${day}, ${year}`
  }
  
  function init() {
    getPackages()
    hideCheckout()
    hideContactForm()
  }
  init()
  
  
  