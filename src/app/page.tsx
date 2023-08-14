"use client"
import "mapbox-gl/dist/mapbox-gl.css"
import {
    faDoorOpen,
    faMinus,
    faMotorcycle,
    faPlus,
    faTrash,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    AutoComplete,
    Button,
    FloatButton,
    Input,
    Modal,
    Select,
    Table,
    Tag,
    Tooltip,
} from "antd"
import React, { useEffect, useRef, useState } from "react"
import { getItems } from "./_server/itemsApi"
import { createOrder, getOrders, updateOrder } from "./_server/ordersApi"
import { getUserById, getUserByRole } from "./_server/userApi"
import { getStatusColor } from "./utils/colors"
import { getColor } from "./utils/colors"
import { Item, Order, Roles, Status, User } from "@/models/types"
import { useRouter } from "next/navigation"
import { logOut } from "./utils/auth"
import { auth } from "@/firebase/clientConfig"
import { useAuthState } from "react-firebase-hooks/auth"

var mapboxgl = require("mapbox-gl/dist/mapbox-gl.js")

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

export default function Manager() {
    const map = useRef<mapboxgl.Map>()
    const router = useRouter()
    const [userData] = useAuthState(auth)
    const [mapRendered, setMapRendered] = useState(false)
    const [showNewOrderModal, setShowNewOrderModal] = useState(false)
    const [addressOptions, setAddressOptions] = useState<any[]>([])
    const [items, setItems] = useState<Item[]>([])
    const [orders, setOrders] = useState<Order[]>([])
    const [couriers, setCouriers] = useState<User[]>([])
    const [newOrder, setNewOrder] = useState<Order>({
        orderNumber: Math.floor(Math.random() * 100),
        clientName: "",
        location: { address: "", lat: 0, lng: 0 },
        courierId: "",
        currentStatus: Status.Created,
        items: [],
        statusHistory: [],
    })

    const columns = [
        {
            title: "#",
            dataIndex: "orderNumber",
            key: "orderNUmber",
        },
        {
            title: "Address",
            dataIndex: "address",
            key: "address",
            render: (address: string) => {
                return <span className="w-64 truncate block">{address}</span>
            },
        },
        {
            title: "Courier",
            dataIndex: "courier",
            key: "courier",
            render: (courierId: string, record: { key: React.Key }) => {
                return (
                    <Select
                        value={
                            couriers.find(
                                (courier) => courier.uid === courierId
                            )?.name || "Unassigned"
                        }
                        options={[
                            { name: "Unnassing", uid: "" },
                            ...couriers,
                        ].map((courier) => {
                            return {
                                label: courier.name,
                                value: courier.uid,
                            }
                        })}
                        onSelect={(value) =>
                            handleUpdateCourier(value, record.key)
                        }
                    />
                )
            },
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status: Status) => {
                return <Tag color={getStatusColor(status)}>{status}</Tag>
            },
        },
    ]

    const handleUpdateCourier = (courierId: string, key: React.Key) => {
        const order = orders.find((order) => order.id === key)
        if (map.current) {
            if (map.current.getSource(`line-${key}`) !== undefined) {
                map.current.removeLayer(`line-${key}`)
                map.current.removeSource(`line-${key}`)
            }
        }
        if (!order) return
        order.courierId = courierId
        updateOrder(order).then((res) => {
            if (res.status !== 200) return
            fetchOrders()
        })
    }

    const handleCreateNewOrder = () => {
        createOrder({
            ...newOrder,
            statusHistory: [
                ...newOrder.statusHistory,
                { status: Status.Created, date: new Date() },
            ],
        }).then((res) => {
            if (res.status !== 200) return
            setShowNewOrderModal(false)
            setNewOrder({
                orderNumber: 0,
                clientName: "",
                location: { address: "", lat: 0, lng: 0 },
                courierId: "",
                currentStatus: Status.Created,
                items: [],
                statusHistory: [],
            })
            fetchOrders()
        })
    }

    const handleAddressChange = (value: string) => {
        fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
                value
            )}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`
        )
            .then((res) => res.json())
            .then((data) => {
                setAddressOptions(data.features)
            })
    }

    const fetchInitData = () => {
        fetchItems()
        fetchCouriers()
        fetchOrders()

        if (mapRendered) return
        map.current = new mapboxgl.Map({
            container: "mapContainer",
            style: "mapbox://styles/cultivandofuturo/cll8oljle00tv01qncqsm3ir7",
            center: [-74.063644, 4.624335],
            zoom: 10,
        })

        setMapRendered(true)
    }
    const fetchItems = async () => {
        const items = await getItems()
        setItems(items)
    }

    const fetchOrders = async () => {
        const orders = await getOrders()
        setOrders(orders)
    }
    const fetchCouriers = async () => {
        const couriers = await getUserByRole("COURIER")
        setCouriers(couriers)
    }

    const renderOrders = () => {
        for (const order of orders) {
            const el = document.createElement("div")
            const { colorClass, color } = getColor(order.orderNumber)
            el.className = `flex border-solid border-2 justify-center items-center rounded-full w-8 h-8 font-bold text-xl  ${colorClass}`
            const span = document.createElement("span")
            span.innerText = order.orderNumber.toString()
            el.appendChild(span)

            new mapboxgl.Marker(el)
                .setLngLat([order.location.lng, order.location.lat])
                .addTo(map.current)

            const courier = couriers.find(
                (courier) => courier.uid === order.courierId
            )
            if (!map.current) return
            if (!courier) {
                if (map.current.getSource(`line-${order.id}`) !== undefined) {
                    map.current.removeLayer(`line-${order.id}`)
                    map.current.removeSource(`line-${order.id}`)
                }
                continue
            }

            if (map.current.getSource(`line-${order.id}`) !== undefined)
                continue

            map.current.addSource(`line-${order.id}`, {
                type: "geojson",
                data: {
                    type: "Feature",
                    properties: {},
                    geometry: {
                        type: "LineString",
                        coordinates: [
                            [order.location.lng, order.location.lat],
                            [
                                courier.location.lng || 0,
                                courier.location.lat || 0,
                            ],
                        ],
                    },
                },
            })
            map.current.addLayer({
                id: `line-${order.id}`,
                type: "line",
                source: `line-${order.id}`,
                layout: {
                    "line-join": "round",
                    "line-cap": "round",
                },
                paint: {
                    "line-color": color,
                    "line-width": 4,
                },
            })
        }
    }

    const renderCouriers = () => {
        for (const courier of couriers) {
            const el = document.createElement("div")
            var svg = document.createElement("svg")
            const html = `<svg width="30" height="29" viewBox="0 0 48 39" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 2.4C20.0025 2.4 19.2 3.2025 19.2 4.2C19.2 5.1975 20.0025 6 21 6H25.3275L26.5575 8.2725L19.2 14.4L15.8025 11.0025C14.9025 10.1025 13.68 9.6 12.405 9.6H4.8C3.4725 9.6 2.4 10.6725 2.4 12V14.4H9.6C16.23 14.4 21.6 19.77 21.6 26.4C21.6 27.225 21.5175 28.0275 21.36 28.8H26.64C26.4825 28.0275 26.4 27.225 26.4 26.4C26.4 22.485 28.275 19.005 31.1775 16.815L32.3325 18.96C30.18 20.7225 28.8 23.4 28.8 26.4C28.8 31.7025 33.0975 36 38.4 36C43.7025 36 48 31.7025 48 26.4C48 21.0975 43.7025 16.8 38.4 16.8C37.3875 16.8 36.4125 16.9575 35.4975 17.25L31.365 9.6H36C37.3275 9.6 38.4 8.5275 38.4 7.2V4.8C38.4 3.4725 37.3275 2.4 36 2.4H34.47C33.9075 2.4 33.3675 2.595 32.9325 2.955L29.3775 5.9175L28.3275 3.9675C27.8025 3 26.79 2.3925 25.6875 2.3925H21V2.4ZM34.7025 23.34L36.8175 27.255C37.29 28.1325 38.385 28.455 39.255 27.9825C40.125 27.51 40.455 26.415 39.9825 25.545L37.8675 21.63C38.04 21.6075 38.22 21.6 38.4 21.6C41.0475 21.6 43.2 23.7525 43.2 26.4C43.2 29.0475 41.0475 31.2 38.4 31.2C35.7525 31.2 33.6 29.0475 33.6 26.4C33.6 25.2375 34.0125 24.1725 34.7025 23.34ZM14.0475 28.2C13.335 29.9625 11.61 31.2 9.6 31.2C6.9525 31.2 4.8 29.0475 4.8 26.4C4.8 23.7525 6.9525 21.6 9.6 21.6C11.6175 21.6 13.3425 22.8375 14.0475 24.6H19.0275C18.1875 20.16 14.2875 16.8 9.6 16.8C4.2975 16.8 0 21.0975 0 26.4C0 31.7025 4.2975 36 9.6 36C14.2875 36 18.1875 32.64 19.035 28.2H14.0475ZM9.6 28.8C10.2365 28.8 10.847 28.5471 11.2971 28.0971C11.7471 27.647 12 27.0365 12 26.4C12 25.7635 11.7471 25.153 11.2971 24.7029C10.847 24.2529 10.2365 24 9.6 24C8.96348 24 8.35303 24.2529 7.90294 24.7029C7.45286 25.153 7.2 25.7635 7.2 26.4C7.2 27.0365 7.45286 27.647 7.90294 28.0971C8.35303 28.5471 8.96348 28.8 9.6 28.8Z" fill="#41FFF4"/>
                        </svg>`
            var xmlDoc = new DOMParser().parseFromString(html, "text/xml")
            el.appendChild(svg)
            svg.appendChild(xmlDoc.documentElement)

            new mapboxgl.Marker(el)
                .setLngLat([courier.location.lng, courier.location.lat])
                .addTo(map.current)
        }
    }
    useEffect(() => {
        renderOrders()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orders])

    useEffect(() => {
        renderCouriers()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [couriers])

    useEffect(() => {
        if (userData) {
            getUserById(userData.uid).then((res) => {
                if (!res.roles?.includes(Roles.Courier)) {
                    router.push("/login")
                }
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userData])

    useEffect(() => {
        fetchInitData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    return (
        <main className="flex flex-col min-h-screen">
            <div
                id="mapContainer"
                className="w-full h-screen position absolute top-0 left-0"
            />
            <div className="flex justify-between w-full absolute p-6">
                <Table
                    className=" min-w-fit max-w-lg p-1"
                    pagination={false}
                    columns={columns}
                    dataSource={orders.map((order) => {
                        return {
                            key: order.id || "",
                            orderNumber: order.orderNumber,
                            address: order.location.address,
                            courier: order.courierId,
                            status: order.currentStatus,
                        }
                    })}
                />
                <div className="flex flex-col">
                    <Tooltip placement="left" title="Go to courier page">
                        <Button
                            className="mb-4"
                            type="default"
                            onClick={() => router.push("/courier")}
                        >
                            <FontAwesomeIcon icon={faMotorcycle} />
                        </Button>
                    </Tooltip>
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
                </div>
            </div>
            <FloatButton
                onClick={() => setShowNewOrderModal(true)}
                type="primary"
                icon={<FontAwesomeIcon icon={faPlus} />}
            />
            <Modal
                open={showNewOrderModal}
                onCancel={() => setShowNewOrderModal(false)}
                title="New order"
                width={400}
                onOk={handleCreateNewOrder}
            >
                <div className="flex flex-col 5">
                    <span className="text-lg">Client name</span>
                    <Input
                        className="my-2"
                        placeholder="John Doe"
                        value={newOrder.clientName}
                        onChange={(e) =>
                            setNewOrder({
                                ...newOrder,
                                clientName: e.target.value,
                            })
                        }
                    />
                    <span className="text-lg">Address</span>
                    <div className="my-2"></div>
                    <AutoComplete
                        className="w-full mb-2"
                        placeholder="Search address"
                        onChange={handleAddressChange}
                        onSelect={(value, option) => {
                            const address = addressOptions.find(
                                (address) => address.id === option.key
                            )
                            setNewOrder({
                                ...newOrder,
                                location: {
                                    address: address?.place_name || "",
                                    lat: address?.center[1] || 0,
                                    lng: address?.center[0] || 0,
                                },
                            })
                        }}
                        options={addressOptions.map((address) => {
                            return {
                                key: address.id,
                                value: address.place_name,
                                label: address.place_name,
                            }
                        })}
                    ></AutoComplete>

                    <span className="text-lg">Items</span>

                    <Select
                        value={""}
                        showSearch
                        className="w-full"
                        options={items
                            .filter((item) => {
                                return !newOrder.items.find(
                                    (i) => i.id === item.id
                                )
                            })
                            .map((item) => {
                                return {
                                    value: item.id,
                                    label: item.name,
                                }
                            })}
                        filterOption={(input, option) =>
                            (option?.label.toLowerCase() ?? "").includes(input)
                        }
                        filterSort={(optionA, optionB) =>
                            (optionA?.label ?? "")
                                .toLowerCase()
                                .localeCompare(
                                    (optionB?.label ?? "").toLowerCase()
                                )
                        }
                        onSelect={(value) => {
                            setNewOrder({
                                ...newOrder,
                                items: [
                                    ...newOrder.items,
                                    {
                                        id: value,
                                        name:
                                            items.find((i) => i.id === value)
                                                ?.name ?? "",
                                        quantity: 1,
                                    },
                                ],
                            })
                        }}
                    />
                    <div className="flex flex-col p-4">
                        {newOrder.items.map((item) => {
                            return (
                                <div
                                    className="flex justify-between mb-1"
                                    key={item.id}
                                >
                                    <span>{item.name}</span>
                                    <div>
                                        {item.quantity > 1 ? (
                                            <FontAwesomeIcon
                                                onClick={() => {
                                                    setNewOrder({
                                                        ...newOrder,
                                                        items: newOrder.items.map(
                                                            (i) => {
                                                                if (
                                                                    i.id ===
                                                                    item.id
                                                                ) {
                                                                    return {
                                                                        ...i,
                                                                        quantity:
                                                                            i.quantity -
                                                                            1,
                                                                    }
                                                                }
                                                                return i
                                                            }
                                                        ),
                                                    })
                                                }}
                                                icon={faMinus}
                                                className="px-3"
                                            />
                                        ) : (
                                            <FontAwesomeIcon
                                                onClick={() => {
                                                    setNewOrder({
                                                        ...newOrder,
                                                        items: newOrder.items.filter(
                                                            (i) =>
                                                                i.id !== item.id
                                                        ),
                                                    })
                                                }}
                                                icon={faTrash}
                                                className="text-red-400 px-3"
                                            />
                                        )}
                                        <span>{item.quantity}</span>

                                        <FontAwesomeIcon
                                            icon={faPlus}
                                            className="px-3"
                                            onClick={() => {
                                                setNewOrder({
                                                    ...newOrder,
                                                    items: newOrder.items.map(
                                                        (i) => {
                                                            if (
                                                                i.id === item.id
                                                            ) {
                                                                return {
                                                                    ...i,
                                                                    quantity:
                                                                        i.quantity +
                                                                        1,
                                                                }
                                                            }
                                                            return i
                                                        }
                                                    ),
                                                })
                                            }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </Modal>
        </main>
    )
}
