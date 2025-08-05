'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Search, ChevronDown, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'

interface GroupItem {
  id: string
  name: string
  type: 'group' | 'subgroup'
  level: number
  groupId?: string
  subgroupId?: string
  productCount: number
}

interface ProductGroup {
  id: string
  name: string
  _count?: {
    products: number
    subgroups: number
  }
  subgroups?: Array<{
    id: string
    name: string
    _count?: {
      products: number
    }
    subgroups?: Array<{
      id: string
      name: string
      _count?: {
        products: number
      }
    }>
  }>
}

interface AdvancedGroupSelectorProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  label?: string
  description?: string
}

export function AdvancedGroupSelector({
  value,
  onValueChange,
  placeholder = "Выберите группу или подгруппу",
  label = "Группа товаров",
  description = "Выберите группу или подгруппу для организации товаров"
}: AdvancedGroupSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const pageSize = 20

  // Загрузка групп с пагинацией
  const loadGroups = async (pageNum: number = 1, search: string = '', reset: boolean = false) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        includeSubgroups: 'true',
        page: pageNum.toString(),
        limit: pageSize.toString(),
        ...(search && { search })
      })

      const response = await fetch(`/api/product-groups?${params}`)
      const result = await response.json()
      
      if (response.ok && result.success) {
        const newGroups = result.data || []
        
        if (reset) {
          setProductGroups(newGroups)
        } else {
          setProductGroups(prev => [...prev, ...newGroups])
        }
        
        setHasMore(newGroups.length === pageSize)
      }
    } catch (error) {
      console.error('Error loading groups:', error)
    } finally {
      setLoading(false)
    }
  }

  // Начальная загрузка
  useEffect(() => {
    loadGroups(1, '', true)
  }, [])

  // Поиск с дебаунсом
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      loadGroups(1, searchQuery, true)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Построение плоского списка групп
  const buildGroupList = useMemo((): GroupItem[] => {
    const groupList: GroupItem[] = []

    productGroups.forEach(group => {
      // Добавляем группу
      groupList.push({
        id: `group-${group.id}`,
        name: group.name,
        type: 'group',
        level: 0,
        groupId: group.id,
        subgroupId: undefined,
        productCount: group._count?.products || 0
      })

      // Добавляем подгруппы первого уровня
      if (group.subgroups) {
        group.subgroups.forEach(subgroup => {
          groupList.push({
            id: `subgroup-${subgroup.id}`,
            name: subgroup.name,
            type: 'subgroup',
            level: 1,
            groupId: group.id,
            subgroupId: subgroup.id,
            productCount: subgroup._count?.products || 0
          })

          // Добавляем подгруппы второго уровня (если есть)
          if (subgroup.subgroups) {
            subgroup.subgroups.forEach(nestedSubgroup => {
              groupList.push({
                id: `subgroup-${nestedSubgroup.id}`,
                name: nestedSubgroup.name,
                type: 'subgroup',
                level: 2,
                groupId: group.id,
                subgroupId: nestedSubgroup.id,
                productCount: nestedSubgroup._count?.products || 0
              })
            })
          }
        })
      }
    })

    return groupList
  }, [productGroups])

  // Фильтрация по поисковому запросу
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return buildGroupList
    
    const query = searchQuery.toLowerCase()
    return buildGroupList.filter(item => 
      item.name.toLowerCase().includes(query)
    )
  }, [buildGroupList, searchQuery])

  // Получение выбранного элемента
  const selectedItem = useMemo(() => {
    return buildGroupList.find(item => item.id === value)
  }, [buildGroupList, value])

  // Загрузка следующей страницы
  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      loadGroups(nextPage, searchQuery, false)
    }
  }

  // Обработка выбора элемента
  const handleSelect = (item: GroupItem) => {
    onValueChange(item.id)
    setOpen(false)
  }

  // Очистка выбора
  const handleClear = () => {
    onValueChange('none')
    setOpen(false)
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="group-selector">{label}</Label>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedItem ? (
              <div className="flex items-center gap-2">
                <div style={{ marginLeft: `${selectedItem.level * 12}px` }} className="flex items-center gap-2">
                  {selectedItem.type === 'group' ? (
                    <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">тг</span>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  )}
                  <span className="truncate">{selectedItem.name}</span>
                </div>
              </div>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-[400px] p-0" align="start">
          <Card className="border-0 shadow-none">
            <CardContent className="p-0">
              {/* Поиск */}
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск групп и подгрупп..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Список групп */}
              <ScrollArea className="h-[300px]">
                <div className="p-2">
                  {/* Опция "Не выбрано" */}
                  <div
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent cursor-pointer"
                    onClick={handleClear}
                  >
                    <span className="text-muted-foreground">Не выбрано</span>
                  </div>

                  {/* Список групп */}
                  {filteredGroups.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between px-3 py-2 text-sm rounded-md hover:bg-accent cursor-pointer group"
                      onClick={() => handleSelect(item)}
                    >
                      <div style={{ marginLeft: `${item.level * 16}px` }} className="flex items-center gap-2 flex-1 min-w-0">
                        {item.type === 'group' ? (
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium shrink-0">тг</span>
                            <span className="font-medium text-slate-800 truncate">{item.name}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0"></span>
                            <span className="text-slate-700 truncate">{item.name}</span>
                          </div>
                        )}
                      </div>
                      
                      <Badge variant="secondary" className="ml-2 shrink-0">
                        {item.productCount}
                      </Badge>
                    </div>
                  ))}

                  {/* Кнопка загрузки еще */}
                  {!searchQuery && hasMore && (
                    <div className="px-3 py-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={loadMore}
                        disabled={loading}
                        className="w-full"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Загрузка...
                          </>
                        ) : (
                          'Загрузить еще'
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Сообщение о пустом результате */}
                  {filteredGroups.length === 0 && !loading && (
                    <div className="px-3 py-8 text-center text-muted-foreground">
                      {searchQuery ? 'Группы не найдены' : 'Нет доступных групп'}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>

      {description && (
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  )
}
