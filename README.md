This project is made [Next.js](https://nextjs.org/) with 💗 by [Nico](https://github.com/nsforero10)!

# FinalStride: Last Mile Logistics Solution - Technical test for KikiLogistics

## Problem to solve:

The last mile delivery problem has long been a hindrance to the effectiveness of the supply chain in the field of logistics. The difficulty is in effectively bridging the distance between distribution facilities and the front doors of end users. This final leg is a sensitive operation vulnerable to inefficiencies and client discontent due to factors including road congestion, delivery route optimization, package security, and timely communications. In order to effectively address this complex issue, a solution must organize smooth collaboration between numerous stakeholders, rely on real-time data for route optimization, guarantee secure and precise deliveries, and keep consumers updated along the process.

## Introducing FinalStride:

FinalStride is an innovative initiative that transforms last mile delivery in the logistics sector. It simplifies and optimizes the complexity of final mile logistics by seamlessly integrating cutting-edge technologies, intuitive interfaces, and strategic algorithms. FinalStride improves productivity, accuracy, and customer satisfaction in the critical last leg of product delivery.

## Features:

### User Authentication and Authorization:

Implement user registration, login, and role-based access control using the Role-Based Access Control (RBAC) design pattern. Admins have access to all features, managers can manage shipments, and couriers can view and update shipment status.

```typescript
enum Roles {
    Admin = "ADMIN",
    Manager = "MANAGER",
    Courier = "COURIER",
}

type User = {
    id?: string
    uid: string
    name: string
    email: string
    roles: Roles[]
    photoURL: string
    location: { lat: number; lng: number }
}
```

### Shipment Management:

-   Add new shipments with sender and receiver information, package details, and delivery dates.
-   Track shipment status and update it as it progresses through different stages (Created, PickedUp, OnTheWay, Arriving, Arrived, Delivered).
-   Implement the State Pattern to manage the different states of a shipment.

```typescript
enum Status {
    Created = "CRD",
    PickedUp = "PKU",
    OnTheWay = "OTW",
    Arriving = "ARG",
    Arrived = "AVD",
    Delivered = "DLD",
}

type Item = {
    id?: string
    name: string
    quantity: number
}

type Order = {
    id?: string
    orderNumber: number
    courierId?: string
    clientName: string
    location: { address: string; lat: number; lng: number }
    currentStatus: Status
    items: {
        id: string
        name: string
        quantity: number
    }[]
    statusHistory: {
        status: Status
        date: Date
    }[]
}
```

## Runing project

This is a fullstack project made in Nextjs, with a RestAPI in `src/app/api` and Web React App on `src/app`. Both using [NextRoutes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)

First, install dependecies

```bash
npm install
# or
yarn
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000/login](http://localhost:3000/login) and login with this google account to view multiple orders already created

```
email: finalstrideapp@gmail.com
password: finalstrideapp15
```

Then you will be redirected to [http://localhost:3000/](http://localhost:3000/), this is the Manager View, where you can:

-   Create new orders
-   Assign orders to different Couriers
-   Check the current state of the orders

On the top right corner, theres two buttons, one for logout, and the other will take you to [http://localhost:3000/courier](http://localhost:3000/courier), here you can:

_This view is mobile first and thought to be used on more handy devices due this could be use on the road (driving, bycicle, motocycle, etc)_

-   Check orders assigned to you
-   Update orders status
-   Get Directions to go to a specific order
-   Get relevant info about each orders (items, status history)

## Tech Stack

-   [Nextjs](https://nextjs.org/)
-   Authentication with [Firebase Auth](https://firebase.google.com/products/auth/)
-   NoSQL database with [Firebase Firestore](https://firebase.google.com/products/firestore/)
-   Map provided by [Mapbox](https://www.mapbox.com/)
-   Design library [Ant Design](https://ant.design/)
-   Iconography by [FontAwesome](https://fontawesome.com/)
-   Deplyed in [Vercel](https://vercel.com/) access here [Final Stride](https://final-stride.vercel.app/)
