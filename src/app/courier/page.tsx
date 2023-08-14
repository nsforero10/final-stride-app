"use client"
import "mapbox-gl/dist/mapbox-gl.css"
import { useEffect, useRef, useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/firebase/clientConfig"
import { getUserById } from "../_server/userApi"
import { Order, Roles, Status, User } from "@/models/types"
import { getOrdersByCourierId, updateOrder } from "../_server/ordersApi"
import { getColor } from "../utils/colors"
import { Button, Divider, List, Modal, Select, Steps, Tooltip } from "antd"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faChevronLeft,
    faChevronRight,
    faDoorOpen,
    faInfoCircle,
} from "@fortawesome/free-solid-svg-icons"
import moment from "moment"
import { logOut } from "../utils/auth"
import { useRouter } from "next/navigation"

var mapboxgl = require("mapbox-gl/dist/mapbox-gl.js")

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

export default function Courier() {
    const map = useRef<mapboxgl.Map>()
    const router = useRouter()
    const [mapRendered, setMapRendered] = useState(false)
    const [userData] = useAuthState(auth)
    const [orders, setOrders] = useState<Order[]>([])
    const [indexOrder, setIndexOrder] = useState<number>(0)
    const [openModal, setOpenModal] = useState<boolean>(false)
    const [user, setUser] = useState<User>()

    const fetchInitData = async () => {
        if (mapRendered) return
        map.current = new mapboxgl.Map({
            container: "mapContainer",
            style: "mapbox://styles/cultivandofuturo/cll8oljle00tv01qncqsm3ir7",
            center: [-74.109114, 4.662733],
            zoom: 10,
        })

        setMapRendered(true)
    }

    const renderOrders = () => {
        for (const order of orders) {
            const el = document.createElement("div")
            const { colorClass } = getColor(order.orderNumber)
            el.className = `flex border-solid border-2 justify-center items-center rounded-full w-8 h-8 font-bold text-xl  ${colorClass}`
            const span = document.createElement("span")
            span.innerText = order.orderNumber.toString()
            el.appendChild(span)

            new mapboxgl.Marker(el)
                .setLngLat([order.location.lng, order.location.lat])
                .addTo(map.current)
        }
        renderRoute(orders[indexOrder])
    }

    const renderRoute = (order: Order) => {
        if (user && map.current) {
            if (map.current?.getSource(`line-${order.id}`) === undefined)
                fetch(
                    `https://api.mapbox.com/directions/v5/mapbox/driving/${user?.location.lng},${user?.location.lat};${order.location.lng},${order.location.lat}?geometries=geojson&access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`
                ).then((res) => {
                    res.json().then((data) => {
                        map.current?.addSource(`line-${order.id}`, {
                            type: "geojson",
                            data: {
                                type: "Feature",
                                properties: {},
                                geometry: {
                                    type: "LineString",
                                    coordinates:
                                        data.routes[0].geometry.coordinates,
                                },
                            },
                        })
                        map.current?.addLayer({
                            id: `line-${order.id}`,
                            type: "line",
                            source: `line-${order.id}`,
                            layout: {
                                "line-join": "round",
                                "line-cap": "round",
                            },
                            paint: {
                                "line-color": getColor(order.orderNumber).color,
                                "line-width": 4,
                            },
                        })
                    })
                })
        }
    }

    useEffect(() => {
        renderRoute(orders[indexOrder])
        map.current?.flyTo({
            center: [
                orders[indexOrder].location.lng,
                orders[indexOrder].location.lat,
            ],
            zoom: 14,
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [indexOrder])

    useEffect(() => {
        if (user) {
            if (orders.length > 0) renderOrders()
            const el = document.createElement("div")
            el

            var svg = document.createElement("svg")
            const html = `<svg width="30" height="29" viewBox="0 0 48 39" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 2.4C20.0025 2.4 19.2 3.2025 19.2 4.2C19.2 5.1975 20.0025 6 21 6H25.3275L26.5575 8.2725L19.2 14.4L15.8025 11.0025C14.9025 10.1025 13.68 9.6 12.405 9.6H4.8C3.4725 9.6 2.4 10.6725 2.4 12V14.4H9.6C16.23 14.4 21.6 19.77 21.6 26.4C21.6 27.225 21.5175 28.0275 21.36 28.8H26.64C26.4825 28.0275 26.4 27.225 26.4 26.4C26.4 22.485 28.275 19.005 31.1775 16.815L32.3325 18.96C30.18 20.7225 28.8 23.4 28.8 26.4C28.8 31.7025 33.0975 36 38.4 36C43.7025 36 48 31.7025 48 26.4C48 21.0975 43.7025 16.8 38.4 16.8C37.3875 16.8 36.4125 16.9575 35.4975 17.25L31.365 9.6H36C37.3275 9.6 38.4 8.5275 38.4 7.2V4.8C38.4 3.4725 37.3275 2.4 36 2.4H34.47C33.9075 2.4 33.3675 2.595 32.9325 2.955L29.3775 5.9175L28.3275 3.9675C27.8025 3 26.79 2.3925 25.6875 2.3925H21V2.4ZM34.7025 23.34L36.8175 27.255C37.29 28.1325 38.385 28.455 39.255 27.9825C40.125 27.51 40.455 26.415 39.9825 25.545L37.8675 21.63C38.04 21.6075 38.22 21.6 38.4 21.6C41.0475 21.6 43.2 23.7525 43.2 26.4C43.2 29.0475 41.0475 31.2 38.4 31.2C35.7525 31.2 33.6 29.0475 33.6 26.4C33.6 25.2375 34.0125 24.1725 34.7025 23.34ZM14.0475 28.2C13.335 29.9625 11.61 31.2 9.6 31.2C6.9525 31.2 4.8 29.0475 4.8 26.4C4.8 23.7525 6.9525 21.6 9.6 21.6C11.6175 21.6 13.3425 22.8375 14.0475 24.6H19.0275C18.1875 20.16 14.2875 16.8 9.6 16.8C4.2975 16.8 0 21.0975 0 26.4C0 31.7025 4.2975 36 9.6 36C14.2875 36 18.1875 32.64 19.035 28.2H14.0475ZM9.6 28.8C10.2365 28.8 10.847 28.5471 11.2971 28.0971C11.7471 27.647 12 27.0365 12 26.4C12 25.7635 11.7471 25.153 11.2971 24.7029C10.847 24.2529 10.2365 24 9.6 24C8.96348 24 8.35303 24.2529 7.90294 24.7029C7.45286 25.153 7.2 25.7635 7.2 26.4C7.2 27.0365 7.45286 27.647 7.90294 28.0971C8.35303 28.5471 8.96348 28.8 9.6 28.8Z" fill="#41FFF4"/>
            </svg>`
            var xmlDoc = new DOMParser().parseFromString(html, "text/xml")
            el.appendChild(svg)
            svg.appendChild(xmlDoc.documentElement)

            new mapboxgl.Marker(el)
                .setLngLat([user.location.lng, user.location.lat])
                .addTo(map.current)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orders])

    useEffect(() => {
        if (userData) {
            getUserById(userData.uid).then((res) => {
                if (!res?.roles?.includes(Roles.Courier)) {
                    router.push("/login")
                }
                setUser(res)
                getOrdersByCourierId(userData.uid).then((orders) => {
                    setOrders(orders)
                    map.current?.flyTo({
                        center: [res.location.lng, res.location.lat],
                        zoom: 12,
                    })
                })
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userData])

    useEffect(() => {
        fetchInitData()
        return () => {
            map.current?.remove()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    return (
        <main className="flex flex-col min-h-screen">
            <div
                id="mapContainer"
                className="w-full h-screen position absolute top-0 left-0 z-0"
            />
            <section className="absolute top-0 right-0 m-4">
                <Tooltip placement="right" title="Log out">
                    <Button
                        type="default"
                        onClick={() => {
                            logOut(() => router.push("/"))
                        }}
                    >
                        <FontAwesomeIcon icon={faDoorOpen} />
                    </Button>
                </Tooltip>
            </section>
            {orders.length > 0 && (
                <>
                    <div className="w-full absolute bottom-0 p-4 text-slate-800">
                        <div className="flex flex-col items-center justify-center bg-slate-300 rounded-lg p-6">
                            <div className="absolute top-6 left-6">
                                <Button
                                    type="text"
                                    onClick={() => {
                                        setOpenModal(true)
                                    }}
                                >
                                    <FontAwesomeIcon
                                        className="text-2xl text-slate-500"
                                        icon={faInfoCircle}
                                    />
                                </Button>
                            </div>
                            <div className="flex flex-col items-center justify-center mb-2">
                                <span className="font-bold text-3xl mb-2">
                                    {orders[indexOrder].clientName}
                                </span>
                                <span className="text-xl text-clip mb-2">
                                    {orders[indexOrder].location.address}
                                </span>
                                <Select
                                    className="w-1/2 max-w-xs"
                                    value={orders[indexOrder].currentStatus}
                                    options={Object.values(Status).map(
                                        (value) => {
                                            return {
                                                value: value,
                                                label: value,
                                            }
                                        }
                                    )}
                                    onSelect={(value) => {
                                        updateOrder({
                                            ...orders[indexOrder],
                                            currentStatus: value,
                                            statusHistory: [
                                                ...orders[indexOrder]
                                                    .statusHistory,
                                                {
                                                    status: value,
                                                    date: new Date(),
                                                },
                                            ],
                                        })
                                        setOrders(
                                            orders.map((order) => {
                                                if (
                                                    order.id ===
                                                    orders[indexOrder].id
                                                ) {
                                                    order.currentStatus = value
                                                    order.statusHistory.push({
                                                        status: value,
                                                        date: new Date(),
                                                    })
                                                }
                                                return order
                                            })
                                        )
                                    }}
                                ></Select>
                            </div>
                            <Divider />
                            <div className="w-full font-bold text-3xl flex items-center justify-evenly">
                                {indexOrder > 0 ? (
                                    <FontAwesomeIcon
                                        icon={faChevronLeft}
                                        onClick={() => {
                                            if (
                                                map.current?.getSource(
                                                    `line-${orders[indexOrder].id}`
                                                ) !== undefined
                                            ) {
                                                map.current?.removeLayer(
                                                    `line-${orders[indexOrder].id}`
                                                )
                                                map.current?.removeSource(
                                                    `line-${orders[indexOrder].id}`
                                                )
                                            }
                                            setIndexOrder(indexOrder - 1)
                                        }}
                                    />
                                ) : (
                                    <div className="w-[30px]" />
                                )}
                                <div className="flex">
                                    <span> Order: </span>
                                    <div
                                        className={`${
                                            getColor(
                                                orders[indexOrder].orderNumber
                                            ).colorClass
                                        } text-center rounded-full w-8 h-8 font-bold text-xl mx-2 border-solid border-2`}
                                    >
                                        {orders[indexOrder].orderNumber}
                                    </div>
                                </div>
                                {indexOrder < orders.length - 1 ? (
                                    <FontAwesomeIcon
                                        icon={faChevronRight}
                                        onClick={() => {
                                            if (
                                                map.current?.getSource(
                                                    `line-${orders[indexOrder].id}`
                                                ) !== undefined
                                            ) {
                                                map.current?.removeLayer(
                                                    `line-${orders[indexOrder].id}`
                                                )
                                                map.current?.removeSource(
                                                    `line-${orders[indexOrder].id}`
                                                )
                                            }
                                            setIndexOrder(indexOrder + 1)
                                        }}
                                    />
                                ) : (
                                    <div className="w-[30px]" />
                                )}
                            </div>
                        </div>
                    </div>
                    <Modal
                        open={openModal}
                        onCancel={() => setOpenModal(false)}
                        onOk={() => setOpenModal(false)}
                    >
                        <span className="text-2xl font-bold">Items</span>
                        <List itemLayout="horizontal">
                            {orders[indexOrder].items.map((item) => {
                                return (
                                    <List.Item key={item.id}>
                                        <List.Item.Meta
                                            title={item.name}
                                            description={`Quantity: ${item.quantity}`}
                                        />
                                    </List.Item>
                                )
                            })}
                        </List>
                        <Divider />
                        <span className="text-2xl font-bold">Status</span>
                        <Steps
                            direction="vertical"
                            current={
                                orders[indexOrder].statusHistory.length - 1
                            }
                            items={Object.values(Status).map((value) => {
                                return {
                                    title: value,
                                    description: moment(
                                        orders[indexOrder].statusHistory.find(
                                            (status) => status.status === value
                                        )?.date
                                    ).format("dddd, MMMM Do YYYY, h:mm:ss a"),
                                }
                            })}
                        />
                    </Modal>
                </>
            )}
        </main>
    )
}
