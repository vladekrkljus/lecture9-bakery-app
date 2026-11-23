export const products={cupcakes:{name:'Dozen cupcakes',price:40,hours:.5},cake:{name:'Cake',price:120,hours:2}};
export const addDays=(date,n)=>new Date(Date.parse(date+'T12:00:00Z')+n*86400000).toISOString().slice(0,10);
export const notice=(date,today)=>date>=addDays(today,2);
export const hours=o=>products[o.product].hours*o.quantity;
export const price=o=>products[o.product].price*o.quantity;
export const reserved=o=>['accepted','picked-up'].includes(o.status);
export function day(s,date,exclude=null){const orders=s.orders.filter(o=>o.date===date&&o.id!==exclude&&reserved(o));return {used:orders.reduce((n,o)=>n+hours(o),0),capacity:s.helpers.includes(date)?12:8,count:orders.length,revenue:orders.reduce((n,o)=>n+price(o),0)};}
export function validate(s,o,old=null){
 if(!o.customer?.trim())return 'Enter a customer name.';
 if(!products[o.product]||!Number.isSafeInteger(o.quantity)||o.quantity<1||o.quantity>1000)return 'Enter a whole quantity between 1 and 1,000.';
 if(!/^\d{4}-\d{2}-\d{2}$/.test(o.date)||Number.isNaN(Date.parse(o.date+'T12:00:00Z'))||new Date(o.date+'T12:00:00Z').toISOString().slice(0,10)!==o.date)return 'Choose a valid pickup date.';
 if(!notice(o.date,s.today)||(old&&!notice(old.date,s.today)))return 'Orders and changes need at least two calendar days’ notice.';
 const d=day(s,o.date,old?.id);if(d.used+hours(o)>d.capacity)return `Not enough capacity: ${d.capacity-d.used}h left, ${hours(o)}h needed.`;
 return '';
}
export function create(s,input){const o={...input,customer:input.customer.trim(),id:s.nextId++,status:'requested',reason:''};o.reason=validate(s,o);if(o.reason)o.status='rejected';s.orders.push(o);return o;}
export function accept(s,id){const o=s.orders.find(o=>o.id===id);if(!o||o.status!=='requested')return 'Only requested orders can be accepted.';const error=validate(s,o);if(error)return error;o.status='accepted';return '';}
export function reject(s,id){const o=s.orders.find(o=>o.id===id);if(!o||o.status!=='requested')return 'Only requested orders can be rejected.';o.status='rejected';o.reason='Declined by baker.';return '';}
export function edit(s,id,input){const o=s.orders.find(o=>o.id===id);if(!o||!['requested','accepted'].includes(o.status))return 'This order is closed.';const candidate={...o,...input};const error=validate(s,candidate,o);if(error)return error;Object.assign(o,candidate);return '';}
export function cancel(s,id){const o=s.orders.find(o=>o.id===id);if(!o||!['requested','accepted'].includes(o.status))return 'This order is closed.';if(!notice(o.date,s.today))return 'Cancellations need at least two calendar days’ notice.';o.status='cancelled';return '';}
export function helper(s,date){if(!notice(date,s.today))return 'Helpers need at least two calendar days’ notice.';if(s.helpers.includes(date))return 'A helper is already booked.';s.helpers.push(date);return '';}
export function advance(s){let accepted=0,rejected=0;for(const o of s.orders.filter(o=>o.status==='requested')){const error=accept(s,o.id);if(error){o.status='rejected';o.reason=error;rejected++;}else accepted++;}for(const o of s.orders)if(o.status==='accepted'&&o.date<=s.today)o.status='picked-up';s.today=addDays(s.today,1);return {accepted,rejected};}
export function seed(){return {today:'2026-11-23',nextId:4,helpers:[],orders:[{id:1,customer:'Jasmine',product:'cupcakes',quantity:3,date:'2026-11-25',status:'requested',reason:''},{id:2,customer:'Okafor',product:'cupcakes',quantity:2,date:'2026-11-24',status:'rejected',reason:'Less than two calendar days’ notice.'},{id:3,customer:'Patel',product:'cake',quantity:1,date:'2026-11-27',status:'requested',reason:''}]};}
