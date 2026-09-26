import { Permission } from "common/models/interface/userInterface";

export const TokenPermissions = [{
    label: "čtení",
    value: Permission.read
}, {
    label: "zápis",
    value: Permission.write
}, {
    label: "ovládání",
    value: Permission.control
}]