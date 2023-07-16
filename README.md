# deer-se
a ~~pretty bad~~ experimental search engine.<br>
live demo: https://deer-se.glitch.me/

this search engine was something i made really quickly, and might continue to work on?<br>
For now it uses standard techniques to query stuff. its not great, but it works.

this search engine also doesnt have a crawler (yet), as users submit a url to it manually (or automatically using the api).

## setup
```sh
git clone https://github.com/woofledev/deer-se && cd deer-se
npm install
node .
```

## api
`POST /api/addpage`<br>
used to add a new page or recrawl a existing one.<br><br>
**body example:** `url=https://example.com&recrawl=true`<br>
`recrawl` is optional, by default it's false<br>
<hr>

`POST /api/query`<br>
queries __ of results (25 by default)<br><br>
**body example:** `q=example&page=2`<br>
`page` is optional, by default it's 1
