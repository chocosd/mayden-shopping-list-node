//

- TASK:
  \*\* create a shopping list with CRUD operations

---

shopping list needs just:

- an array of shopping items
- each shopping item needs a name
- each shopping item needs a price
- each shopping item needs an order
- each shopping item needs a boolean bought field
- shopping list needs a total price field too

//

export interface ShoppingItem {
name: string;
price: number;
order: number;
bought: boolean;
// TODO: circle back to this
}

---

user should be able to:

- add items
- reorder items
- remove items
- rename items
- adjust price, maybe ?

---

backend should be able to:

- authenticate the user
- persist and save the data to the database with an api for the shopping list
- remove items that have been deleted, either entirely or temporary
- (possibly) handle emailing the list.
