import { Status } from "@/models/types"

export const getColor = (orderNumber: number) => {
    const colors = [
        { colorClass: "color-1", color: "#6ff0bb" },
        { colorClass: "color-2", color: "#af44ff" },
        { colorClass: "color-3", color: "#7c00ff" },
        { colorClass: "color-4", color: "#ff5441" },
        { colorClass: "color-5", color: "#e000c0" },
        { colorClass: "color-6", color: "#f78200" },
        { colorClass: "color-7", color: "#00c804" },
        { colorClass: "color-8", color: "#db0c0c" },
        { colorClass: "color-9", color: "#a5fcec" },
    ]
    return colors[orderNumber % colors.length]
}

export function getStatusColor(status: Status) {
    switch (status) {
        case Status.Created:
            return "magenta"
        case Status.PickedUp:
            return "purple"
        case Status.OnTheWay:
            return "geekblue"
        case Status.Arriving:
            return "lime"
        case Status.Arrived:
            return "green"
        case Status.Delivered:
            return "cyan"
        default:
            return "magenta"
    }
}
