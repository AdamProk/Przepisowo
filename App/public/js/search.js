function searchRecipe() {
    var input, filter;
    input = document.getElementById('search_bar');
    filter = input.value.toLowerCase();

    fetch('searchRecipe',  {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'filter=' + encodeURIComponent(filter),
    })
    .then(response => response.text())
    .then(data => {
        document.querySelector('.recipes').innerHTML = data;
    })
    .catch(error => {
        console.error('Error fetching search results:', error);
    });
}