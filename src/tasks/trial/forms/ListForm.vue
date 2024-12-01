<template>
  <div class="card d-print-none mb-2">
    <div class="card-body">
      <router-link v-if="taskData.permissions.action_1"  :to="taskData.api_url+'/'+taskData.crop_id+'/add'" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" ><i class="feather icon-plus-circle"></i> {{labels.get('action_1')}}</router-link>
      <button type="button" v-if="taskData.permissions.action_4" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" onclick="window.print();"><i class="feather icon-printer"></i> {{labels.get('action_4')}}</button>
      <button type="button" v-if="taskData.permissions.action_5" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="systemFunctions.exportCsv(taskData.columnsForm,taskData.itemsFilteredForm,taskData.api_url.substring(1)+'_'+taskData.cropInfo.name+'.csv')"><i class="feather icon-download"></i> {{labels.get('action_5')}}</button>
      <button type="button" v-if="taskData.permissions.action_8" class="mr-2 mb-2 btn btn-sm" :class="[show_column_controls?'bg-gradient-success':'bg-gradient-primary']" @click="show_column_controls = !show_column_controls"><i class="feather icon-command"></i> {{labels.get('action_8')}}</button>
      <button type="button" v-if="taskData.permissions.action_0" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="taskData.reloadItemsForm(taskData.paginationForm)"><i class="feather icon-rotate-cw"></i> {{labels.get('label_refresh')}}</button>
    </div>
  </div>
  <ColumnControl :url="taskData.api_url.substring(1)" :method="'list-from'" :columns="taskData.columnsForm"  v-if="show_column_controls"/>
  <div class="card mb-2">
    <div class="card-header d-print-none">
      {{taskData.cropInfo.name}}
      <div>{{labels.get('label_task')}}</div>
    </div>
    <div class="card-body" style='overflow-x:auto;min-height:250px;'>
      <table class="table table-bordered">
        <thead class="table-active">
        <tr>
          <th class="position-relative align-middle d-print-none">{{labels.get('label_action')}}</th>
          <template v-for="(column,key) in taskData.columnsForm.all">
            <th class="position-relative align-middle" v-if="taskData.columnsForm.hidden.indexOf(key)<0" :key="'th_'+key">
              <ColumnSort :columns="taskData.columnsForm" :sortKey="key" :position="'left:5px'"  :onChangeSort="taskData.setFilteredItemsForm" v-if="taskData.permissions.action_6 && column.sortable"/>
              <div class=" text-center " style="width:calc(100% - 33px);margin-left:17px">
                {{ column.label }}
              </div>
              <ColumnFilter :column="column" :position="'right:5px'"  :onChangeFilter="taskData.setFilteredItemsForm" v-if="taskData.permissions.action_6 && column.filterable"/>
            </th>
          </template>
        </tr>
        </thead>
        <tbody class="table-striped table-hover">
        <tr v-for="item in taskData.itemsFilteredForm" :key="'item_'+item.id">
          <td class="col_1 d-print-none">
            <button class="btn btn-sm bg-gradient-primary dropdown-toggle waves-effect waves-light" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">{{labels.get('label_action')}}</button>
            <div class="dropdown-menu" aria-labelledby="dropdownMenuButton" x-placement="bottom-start" style="position: absolute; will-change: transform; top: 0; left: 0; transform: translate3d(0px, 38px, 0px);">
              <router-link v-if="taskData.permissions.action_0"  :to="taskData.api_url+'/'+taskData.crop_id+'/inputs/'+item.id" class="dropdown-item text-info btn-sm" ><i class="feather icon-camera"></i> {{labels.get('label_show_inputs')}}</router-link>
              <router-link v-if="taskData.permissions.action_2"  :to="taskData.api_url+'/'+taskData.crop_id+'/edit/'+item.id" class="dropdown-item text-info btn-sm" ><i class="feather icon-edit"></i> {{labels.get('label_edit')}}</router-link>
            </div>
          </td>
          <template v-for="(column,key) in taskData.columnsForm.all">
            <td :class="((['id','ordering','entry_count'].indexOf(key) != -1)?'text-right':'')+(column.class?(' '+column.class):'col_9')" v-if="taskData.columnsForm.hidden.indexOf(key)<0" :key="'td_'+key">
              {{ (key=='entry_count' && item[key]==-1)?'Unknown': item[key] }}
            </td>
          </template>

        </tr>
        </tbody>
      </table>
      <Pagination :items = "taskData.itemsForm" :onChangePageOption="taskData.reloadItemsForm" :pagination="taskData.paginationForm"/>
    </div>
  </div>
</template>
<script setup> 

    import systemFunctions from "@/assets/systemFunctions";

    import labels from '@/labels'  
    import { inject,ref } from 'vue'
    import {useRouter} from 'vue-router';

    import ColumnControl from '@/components/ColumnControl.vue';
    import ColumnSort from '@/components/ColumnSort.vue';
    import ColumnFilter from '@/components/ColumnFilter.vue';
    import Pagination from '@/components/Pagination.vue';


    const router =useRouter()
    let taskData = inject('taskData')
    let show_column_controls=ref(false)
    const setColumns=()=>{
      let columns={}
      let key='id';
      columns[key]={
        label: labels.get('label_'+key),
        hideable:true,
        filterable:true,
        sortable:true,
        type:'number',
        filter:{from:'',to:''},
        class:'col_1'
      };
      key='name';
      columns[key]={
        label: labels.get('label_'+key),
        hideable:false,
        filterable:true,
        sortable:true,
        type:'text',
        filter:{from:'',to:''}
      };
      let entry_count_options=Array(10).fill(1).map((n, i) =>{ return {value:(n+i),label:n+i}})
      entry_count_options.unshift({value: -1,label: labels.get('label_entry_count_unknown')})
      key='entry_count';
      columns[key]={
        label: labels.get('label_'+key),
        hideable:true,
        filterable:true,
        sortable:true,
        type:'dropdown',
        //filter:{from:'',to:'',options:[{value:'1',label:1},{value:'2',label:'2'}]},
        filter:{from:'',to:'',options:entry_count_options},
        class:'col_1'
      };
      key='entry_interval';
      columns[key]={
        label: labels.get('label_'+key),
        hideable:true,
        filterable:true,
        sortable:true,
        type:'number',
        filter:{from:'',to:''},
        class:'col_1'
      };
      key='ordering';
      columns[key]={
        label: labels.get('label_'+key),
        hideable:true,
        filterable:false,
        sortable:true,
        type:'number',
        filter:{from:'',to:''},
        class:'col_1'
      };
      key='status';
      columns[key]={
        label: labels.get('label_'+key),
        hideable:true,
        sortable:true,
        filterable:true,
        type:'dropdown',
        filter:{from:'',to:'',options:[{value:'Active',label:'Active'},{value:'In-Active',label:'In-Active'}]},
        class:'col_1'
      };
      key='created_at';
      columns[key]={
        label: labels.get('label_'+key),
        hideable:true,
        filterable:true,
        sortable:true,
        type:'date',
        filter:{from:'',to:''}
      };
      taskData.columnsForm.all=columns
    }
    setColumns();

</script>

