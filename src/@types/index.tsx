import type { ReactNode } from "react";

export interface StackType {
    key?:number,
    id:number,
    name:string,
    description:string,
    action?:ReactNode
}