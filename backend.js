// ⚠️ ADD YOUR JSEARCH API KEY HERE ⚠️
const JSEARCH_API_KEY = '9aacfabcd8msh3e27ce4411a228ep1931c1jsn85db2a30dca5';

// Form data storage
let formData = {
  name: '',
  q1: '',
  q2: '',
  q3: '',
  q4: '',
  q5: ''
};

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
  setupEventListeners();
});

function setupEventListeners() {
  // Get the form
  const form = document.getElementById('quiz');
  
  // Prevent default form submission
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      handleSubmit();
    });
  }
  
  // Listen for input changes
  const inputs = document.querySelectorAll('input[type="text"], input[type="radio"]');
  inputs.forEach(input => {
    input.addEventListener('change', function(e) {
      formData[e.target.name] = e.target.value;
    });
  });
}

function handleSubmit() {
  // Validate all questions are answered
  if (!formData.name || !formData.q1 || !formData.q2 || !formData.q3 || !formData.q4 || !formData.q5) {
    showError('Please answer all questions before submitting!');
    return;
  }
  
  // Clear any existing errors
  clearError();
  
  // Show loading state
  showLoading();
  
  // Search for jobs
  searchJobs();
}

function mapQuizToJobQuery() {
  let keywords = [];
  
  // Q2: Work environment pace
  if (formData.q2 === 'fast-paced') {
    keywords.push('startup', 'sales', 'emergency');
  } else if (formData.q2 === 'calm') {
    keywords.push('research', 'analyst', 'librarian');
  }
  
  // Q3: Team vs independent
  if (formData.q3 === 'together') {
    keywords.push('team lead', 'coordinator', 'manager');
  } else if (formData.q3 === 'alone') {
    keywords.push('developer', 'writer', 'analyst');
  }
  
  // Q4: Work setting
  if (formData.q4 === 'outside') {
    keywords.push('field', 'outdoor', 'travel');
  } else if (formData.q4 === 'office') {
    keywords.push('office', 'administrative');
  } else if (formData.q4 === 'lab') {
    keywords.push('laboratory', 'research', 'scientist');
  }

  /*Q5: Location
  if (formData.q5 === 'Midwest'){
    keywords.push('Michigan', 'Ohio', 'Illnois', 'Wisconsin', 'Minnesota', 'Indiana')
  } else if (formData.q5 === 'Northeast'){
    keywords.push('New York', 'Pennsylvania', 'New Jersey', 'New Hampshire')
  } else if(formData.q5 === 'South'){
    keywords.push('Texas', 'Florida', 'South Carolina', 'North Carolina', 'Missouri', 'Virginia')
  } else if(formData.q5 === 'West'){
    keywords.push('California', 'Arizona','Washington','Nevada','Utah')
  }
  */

  // Default to general search if no keywords
  return keywords.length > 0 ? keywords.join(' OR ') : 'entry level';
}
  function getLocationsFromQuiz() {
    
    
    
    if (!formData.q5) return null;

    if (formData.q5 === 'south') {
      return ['Georgia', 'Florida', 'Texas', 'North Carolina', 'South Carolina', 'Alabama', 'Louisiana'];
    }

  
    if (formData.q5 === 'northeast') {
      return ['New York', 'Massachusetts', 'Pennsylvania', 'New Jersey', 'Connecticut'];
    }

    if (formData.q5 === 'west') {
      return ['California', 'Washington', 'Oregon', 'Nevada', 'Arizona'];
    }
    

    if (formData.q5 === 'midwest') {
      return ['Illinois', 'Ohio', 'Michigan', 'Wisconsin', 'Minnesota'];
    }
    

  }
  
  async function searchJobs() {
    try {
      const query = mapQuizToJobQuery();
      const employmentType = formData.q1 === 'full-time' ? 'FULLTIME' : 'PARTTIME';
      
      // Get location info 
      const locations = getLocationsFromQuiz();
      
      if (locations && locations.length > 0) {
        let allJobs = [];
        
        for (const location of locations) {
          const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query + ' in ' + location)}&page=1&num_pages=1&employment_types=${employmentType}`;
          
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'X-RapidAPI-Key': JSEARCH_API_KEY,
              'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
            }
          });
          
          if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.data && data.data.length > 0) {
            allJobs = allJobs.concat(data.data);
          }
        }
        
        if (allJobs.length > 0) {
          // Remove duplicates based on job_id
          const uniqueJobs = Array.from(new Map(allJobs.map(job => [job.job_id, job])).values());
          displayJobResults(uniqueJobs.slice(0, 10));
        } else {
          hideLoading();
          showError('No jobs found matching your preferences. Try adjusting your answers!');
        }
      } else {
        // No specific location, do regular search
        const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=1&num_pages=1&employment_types=${employmentType}`;
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': JSEARCH_API_KEY,
            'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
          }
        });
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
          displayJobResults(data.data.slice(0, 10));
        } else {
          hideLoading();
          showError('No jobs found matching your preferences. Try adjusting your answers!');
        }
      }
      
    } catch (err) {
      hideLoading();
      showError(`Error fetching jobs: ${err.message}. Please check your API key!`);
      console.error('Job search error:', err);
    }
  }
function displayJobResults(jobs) {
  // Hide the quiz form
  const quizSection = document.getElementById('section1');
  if (quizSection) {
    quizSection.style.display = 'none';
  }
  
  // Create results container
  const main = document.querySelector('main');
  const resultsDiv = document.createElement('div');
  resultsDiv.id = 'job-results';
  
  // Create header
  const header = document.createElement('div');
  header.style.textAlign = 'center';
  header.style.marginBottom = '2rem';
  header.innerHTML = `
    <h1>Your Personalized Job Matches, ${formData.name}!</h1>
    <p>Based on your preferences, we found ${jobs.length} opportunities for you.</p>
    <button onclick="resetQuiz()" style="background-color: #ffa200; color: white; text-align: center; border-radius: 8px; padding: 15px 30px; font-size: large; border: none; cursor: pointer; margin-top: 1rem;">
      Take Quiz Again
    </button>
  `;
  resultsDiv.appendChild(header);
  
  // Create jobs grid
  const jobsGrid = document.createElement('div');
  jobsGrid.style.display = 'grid';
  jobsGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(300px, 1fr))';
  jobsGrid.style.gap = '1.5rem';
  
  jobs.forEach(job => {
    const jobCard = createJobCard(job);
    jobsGrid.appendChild(jobCard);
  });
  
  resultsDiv.appendChild(jobsGrid);
  main.appendChild(resultsDiv);
}

function createJobCard(job) {
  const card = document.createElement('div');
  card.style.backgroundColor = 'white';
  card.style.borderRadius = '8px';
  card.style.padding = '1.5rem';
  card.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
  
  let cardHTML = `
    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
      <div style="flex: 1;">
        <h3 style="font-weight: bold; font-size: 1.25rem; margin-bottom: 0.5rem;">${job.job_title}</h3>
        <p style="font-size: 18px; margin-bottom: 0.5rem;">${job.employer_name}</p>
      </div>
  `;
  
  if (job.employer_logo) {
    cardHTML += `
      <img src="${job.employer_logo}" alt="${job.employer_name}" 
           style="width: 48px; height: 48px; object-fit: contain; margin-left: 1rem;" />
    `;
  }
  
  cardHTML += `</div><div style="margin-bottom: 1rem;">`;
  
  // Location
  cardHTML += `
    <div style="display: flex; align-items: center; margin-bottom: 0.5rem; font-size: 16px;">
      📍 <span style="margin-left: 0.5rem;">${job.job_city}, ${job.job_state || job.job_country}</span>
    </div>
  `;
  
  // Employment type
  if (job.job_employment_type) {
    cardHTML += `
      <div style="display: flex; align-items: center; margin-bottom: 0.5rem; font-size: 16px;">
        🕐 <span style="margin-left: 0.5rem;">${job.job_employment_type.replace('_', ' ')}</span>
      </div>
    `;
  }
  
  // Salary
  if (job.job_min_salary || job.job_max_salary) {
    let salaryText = '';
    if (job.job_min_salary) salaryText += `$${job.job_min_salary.toLocaleString()}`;
    if (job.job_min_salary && job.job_max_salary) salaryText += ' - ';
    if (job.job_max_salary) salaryText += `$${job.job_max_salary.toLocaleString()}`;
    
    cardHTML += `
      <div style="display: flex; align-items: center; margin-bottom: 0.5rem; font-size: 16px;">
        💵 <span style="margin-left: 0.5rem;">${salaryText}</span>
      </div>
    `;
  }
  
  cardHTML += `</div>`;
  
  // Description
  if (job.job_description) {
    const shortDesc = job.job_description.length > 200 
      ? job.job_description.substring(0, 200) + '...'
      : job.job_description;
    cardHTML += `
      <p style="font-size: 16px; margin-bottom: 1rem;">${shortDesc}</p>
    `;
  }
  
  // Apply button
  cardHTML += `
    <a href="${job.job_apply_link}" target="_blank" rel="noopener noreferrer"
       style="display: inline-flex; align-items: center; background-color: #ffa200; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 16px;">
      Apply Now →
    </a>
  `;
  
  card.innerHTML = cardHTML;
  return card;
}

function resetQuiz() {
  // Clear form data
  formData = {
    name: '',
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    q5: ''
  };
  
  // Remove results
  const results = document.getElementById('job-results');
  if (results) {
    results.remove();
  }
  
  // Show quiz form again
  const quizSection = document.getElementById('section1');
  if (quizSection) {
    quizSection.style.display = 'block';
  }
  
  // Reset form inputs
  const form = document.getElementById('quiz');
  if (form) {
    form.reset();
  }
  
  // Clear any errors
  clearError();
}

function showLoading() {
  const button = document.querySelector('button[type="submit"]');
  if (button) {
    button.disabled = true;
    button.innerHTML = '🔄 Finding Your Perfect Jobs...';
    button.style.backgroundColor = '#ccc';
  }
}

function hideLoading() {
  const button = document.querySelector('button[type="submit"]');
  if (button) {
    button.disabled = false;
    button.innerHTML = 'Submit & Find Jobs';
    button.style.backgroundColor = '#ffa200';
  }
}

function showError(message) {
  // Remove existing error if any
  clearError();
  
  // Create error message
  const errorDiv = document.createElement('div');
  errorDiv.id = 'error-message';
  errorDiv.style.backgroundColor = '#ffebee';
  errorDiv.style.border = '1px solid #f44336';
  errorDiv.style.color = '#c62828';
  errorDiv.style.padding = '1rem';
  errorDiv.style.borderRadius = '0.2rem';
  errorDiv.style.marginBottom = '1.5rem';
  errorDiv.style.fontSize = '18px';
  errorDiv.textContent = message;
  
  // Insert before submit button
  const button = document.querySelector('button[type="submit"]');
  if (button && button.parentNode) {
    button.parentNode.insertBefore(errorDiv, button);
  }
}

function clearError(){
  const errorDiv = document.getElementById('error-message');
  if (errorDiv) {
    errorDiv.remove();
  }
}