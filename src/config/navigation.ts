import { Gift, BookOpen, Users, Swords, Package, Shirt } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavigationItem {
	key: string // 用于翻译键，如 'codes' -> t('nav.codes')
	path: string // URL 路径，如 '/codes'
	icon: LucideIcon // Lucide 图标组件
	isContentType: boolean // 是否对应 content/ 目录
}

// 导航配置：6 个内容类型（以 content/ 实际文章分类为唯一来源）
// 顺序：Codes（福利入口，最高流量）→ Guide → Characters → Abilities → Items → Skins
export const NAVIGATION_CONFIG: NavigationItem[] = [
	{ key: 'codes', path: '/codes', icon: Gift, isContentType: true },
	{ key: 'guide', path: '/guide', icon: BookOpen, isContentType: true },
	{ key: 'characters', path: '/characters', icon: Users, isContentType: true },
	{ key: 'abilities', path: '/abilities', icon: Swords, isContentType: true },
	{ key: 'items', path: '/items', icon: Package, isContentType: true },
	{ key: 'skins', path: '/skins', icon: Shirt, isContentType: true },
]

// 从配置派生内容类型列表（用于路由和内容加载）
export const CONTENT_TYPES = NAVIGATION_CONFIG.filter((item) => item.isContentType).map(
	(item) => item.path.slice(1),
) // 移除开头的 '/'

export type ContentType = (typeof CONTENT_TYPES)[number]

// 辅助函数：验证内容类型
export function isValidContentType(type: string): type is ContentType {
	return CONTENT_TYPES.includes(type as ContentType)
}
