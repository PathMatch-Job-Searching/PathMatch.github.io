
// is an element in the screen? if so then...
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  // it will turn on when at least 40% of any element is visible
  return rect.top < window.innerHeight * 0.4 && rect.bottom >= window.innerHeight * 0.2;
}

// java function to add the "visible" class to the thing when the element is in the viewport
function handleScroll() {
  const sections = document.querySelectorAll('.section');
  
  sections.forEach((section) => {
      if (isInViewport(section)) {
          section.classList.add('visible');
      } 
  });
}
// this is a heck ton of yapping... what I love most
// "listen" for scroll events so when someone scrolls it knows...
window.addEventListener('scroll', handleScroll);

// call handlescroll once on page load to handle appearing
handleScroll();
