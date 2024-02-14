    async function liveSearch() {
      const input = document.getElementById('searchedUsername');
      const resultContainer = document.getElementById('searchResults');
      const userDetailsContainer = document.getElementById('userDetails');
      resultContainer.innerHTML = '';
      userDetailsContainer.innerHTML = '';
  
      const query = input.value.trim();
  
      if (query !== '') {
        try {
        
          const response = await fetch(`/live-search?query=${query}`);
          const data = await response.json();
  
          data.forEach(user => {
            const listItem = document.createElement('li');
            listItem.textContent = user.username;
            listItem.classList.add('list-group-item');
            listItem.addEventListener('click', async function() {
              // Fetch user details and update the page
              const userDetailsResponse = await fetch(`/search?searchedUsername=${user.username}`);
              const userDetailsData = await userDetailsResponse.json();
              updateDetails(userDetailsData);
            });
            resultContainer.appendChild(listItem);
          });
        } catch (error) {
          console.error('Error during live search:', error);
        }
      }
    }
  
    function updateDetails(data) {
      const userDetailsContainer = document.getElementById('userDetails');
  
      if (data.error) {
        const errorElement = document.createElement('p');
        errorElement.classList.add('text-danger');
        errorElement.textContent = data.error;
        userDetailsContainer.appendChild(errorElement);
      } else {
        const userElement = document.createElement('h2');
        userElement.textContent = 'User Details';
        userDetailsContainer.appendChild(userElement);
  
        const usernameElement = document.createElement('p');
        usernameElement.textContent = `Username: ${data.user.username}`;
        userDetailsContainer.appendChild(usernameElement);
  
        if (data.details.length > 0) {
          const postgresDetailsElement = document.createElement('h2');
          postgresDetailsElement.textContent = 'User PostgreSQL Details';
          userDetailsContainer.appendChild(postgresDetailsElement);
  
          const ulElement = document.createElement('ul');
          ulElement.classList.add('list-group');
          data.details.forEach(detail => {
            const liElement = document.createElement('li');
            liElement.classList.add('list-group-item');
            liElement.textContent = `City: ${detail.city}, Birthdate: ${detail.birthdate}`;
            ulElement.appendChild(liElement);
          });
          userDetailsContainer.appendChild(ulElement);
        } else {
          const noDetailsElement = document.createElement('p');
          noDetailsElement.textContent = 'No details found in PostgreSQL for this user.';
          userDetailsContainer.appendChild(noDetailsElement);
        }
      }
    }
