// will make this prettier later
!function(){
    function qg(n){return new URLSearchParams(window.location.search).get(n)}
    if(!qg('q')){window.location.href = "/"}else{
        document.title = `deer-se: ${qg('q')}`;
        document.getElementById('query').value = qg('q');

        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/query', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onload = function() {
            if (xhr.status === 200) {
                const res = JSON.parse(xhr.responseText);
                const results = document.getElementById('results');

                res.forEach(result => {
                    var div = document.createElement('div');
                    var link = document.createElement('a');
                    var title = document.createElement('h3');
                    var desc = document.createElement('small');
                    var topurl = document.createElement('small');
                    topurl.textContent = result.url;
                    link.href = result.url;
                    title.innerText = result.title;
                    title.style = 'margin: 0;';
                    desc.innerText = result.desc;

                    link.appendChild(title);
                    div.appendChild(topurl);div.appendChild(link);div.appendChild(desc);
                    results.appendChild(div);
                    results.appendChild(document.createElement('br'));
                });
            }
        }
        xhr.send(`q=${encodeURIComponent( qg('q') )}&page=${ parseInt(qg('page')) || 1 }`);

        var pagesel = document.getElementById('pages');
        pagesel.value = parseInt(qg('page')) || 1;
        pagesel.addEventListener('keypress', (e)=>{
            if (e.key === 'Enter') {
                window.location.href = `/search?q=${qg('q')}&page=${pagesel.value}`
            }
        });
    }
}();