import App from './App.svelte';
import {monthNames} from './app.constants';

let o = new Intl.DateTimeFormat("en-IN" , {
    timeStyle: "short",
    dateStyle: "medium"
});
Date.prototype.toIndianFormat = function() {
    return o.format(this);
}

Date.prototype.toDurationFormat = function() {
    
    let monthIndex = this.getMonth();
    let monthName = monthNames[monthIndex];

    let year = this.getFullYear();
    
    return `${monthName}-${year}`;  
}

const app = new App({
	target: document.body
});

export default app;