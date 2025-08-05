'use client';

import { useState } from 'react';
import { ProductGroupsTable } from '@/components/product-groups-table';
import { CreateGroupModal } from '@/components/create-group-modal';
import { EditGroupModal } from '@/components/edit-group-modal';
import { CreateSubgroupModal } from '@/components/create-subgroup-modal';
import { EditSubgroupModal } from '@/components/edit-subgroup-modal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { ProductGroup, ProductSubgroup } from '@/types/product-groups';

export function ProductGroupsSection() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createSubgroupModalOpen, setCreateSubgroupModalOpen] = useState(false);
  const [editSubgroupModalOpen, setEditSubgroupModalOpen] = useState(false);
  
  const [selectedGroup, setSelectedGroup] = useState<ProductGroup | null>(null);
  const [selectedSubgroup, setSelectedSubgroup] = useState<ProductSubgroup | null>(null);
  const [parentForSubgroup, setParentForSubgroup] = useState<{ group?: ProductGroup; subgroup?: ProductSubgroup } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [groups, setGroups] = useState<ProductGroup[]>([]);

  const handleGroupChange = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleEdit = (group: ProductGroup) => {
    setSelectedGroup(group);
    setEditModalOpen(true);
  };

  const handleCreateSubgroup = (parent: { group?: ProductGroup; subgroup?: ProductSubgroup }) => {
    setParentForSubgroup(parent);
    setCreateSubgroupModalOpen(true);
  };

  const handleEditSubgroup = (subgroup: ProductSubgroup) => {
    setSelectedSubgroup(subgroup);
    setEditSubgroupModalOpen(true);
  };

  const handleGroupsChange = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-border/10 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Группы товаров</h3>
            <p className="text-sm text-muted-foreground">Организация товаров по категориям</p>
          </div>
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Создать группу
          </Button>
        </div>
        <div className="flex-1 min-h-0">
          <ProductGroupsTable 
            key={refreshKey} 
            onEdit={handleEdit}
            onCreateSubgroup={handleCreateSubgroup}
            onEditSubgroup={handleEditSubgroup}
            onGroupsChange={handleGroupsChange}
          />
        </div>
      </div>

      <CreateGroupModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onGroupCreated={handleGroupChange}
      />
      
      <EditGroupModal
        group={selectedGroup}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onGroupUpdated={handleGroupChange}
      />

      <CreateSubgroupModal
        isOpen={createSubgroupModalOpen}
        onClose={() => setCreateSubgroupModalOpen(false)}
        onSuccess={handleGroupChange}
        groups={groups}
        parentGroup={parentForSubgroup?.group}
        parentSubgroup={parentForSubgroup?.subgroup}
      />

      <EditSubgroupModal
        isOpen={editSubgroupModalOpen}
        onClose={() => setEditSubgroupModalOpen(false)}
        onSuccess={handleGroupChange}
        groups={groups}
        subgroup={selectedSubgroup}
      />
    </>
  );
}
