<template>    
    <div class="card d-print-none mb-2">
        <div class="card-body">
            <router-link v-if="taskData.permissions.action_1 || taskData.permissions.action_2"  :to="taskData.api_url+'/add'" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" ><i class="feather icon-plus-circle"></i> {{labels.get('action_1')}}/{{labels.get('label_edit')}}</router-link>
            <button type="button" v-if="taskData.permissions.action_4" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" onclick="window.print();"><i class="feather icon-printer"></i> {{labels.get('action_4')}}</button>
            <button type="button" v-if="taskData.permissions.action_5" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="systemFunctions.exportCsv(taskData.columns,taskData.itemsFiltered,'Distributors Sales.csv')"><i class="feather icon-download"></i> {{labels.get('action_5')}}</button>
            <button type="button" v-if="taskData.permissions.action_8" class="mr-2 mb-2 btn btn-sm" :class="[show_column_controls?'bg-gradient-success':'bg-gradient-primary']" @click="show_column_controls = !show_column_controls"><i class="feather icon-command"></i> {{labels.get('action_8')}}</button>
            <button type="button" v-if="taskData.permissions.action_0" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="taskData.reloadItems(taskData.pagination)"><i class="feather icon-rotate-cw"></i> {{labels.get('label_refresh')}}</button>
            <router-link v-if="taskData.permissions.action_3"  :to="taskData.api_url+'/upload'" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" ><i class="feather icon-upload"></i> {{labels.get('label_upload')}}</router-link>
        </div>            
    </div>
  <ColumnControl :url="taskData.api_url.substring(1)" :columns="taskData.columns"  v-if="show_column_controls"/>
  <div class="card mb-2">
    <div class="card-header d-print-none">
      {{labels.get('label_task')}}
    </div>
    <div class="card-body" style='overflow-x:auto;min-height:250px;'>
      <table class="table table-bordered">
        <thead class="table-active">
        <tr>
          <th class="position-relative align-middle d-print-none">{{labels.get('label_action')}}</th>
          <template v-for="(column,key) in taskData.columns.all">
            <th class="position-relative align-middle" v-if="taskData.columns.hidden.indexOf(key)<0" :key="'th_'+key">
              <ColumnSort :columns="taskData.columns" :sortKey="key" :position="'left:5px'"  :onChangeSort="taskData.setFilteredItems" v-if="taskData.permissions.action_6 && column.sortable"/>
              <div class=" text-center " style="width:calc(100% - 33px);margin-left:17px">
                {{ column.label }}
              </div>
              <ColumnFilter :column="column" :position="'right:5px'"  :onChangeFilter="taskData.setFilteredItems" v-if="taskData.permissions.action_6 && column.filterable"/>
            </th>
          </template>
        </tr>
        </thead>
        <tbody class="table-striped table-hover">
        <tr v-for="item in taskData.itemsFiltered" :key="'item_'+item.id">
          <td class="col_1 d-print-none">
            <button class="btn btn-sm bg-gradient-primary dropdown-toggle waves-effect waves-light" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">{{labels.get('label_action')}}</button>
            <div class="dropdown-menu" aria-labelledby="dropdownMenuButton" x-placement="bottom-start" style="position: absolute; will-change: transform; top: 0; left: 0; transform: translate3d(0px, 38px, 0px);">
              <router-link v-if="taskData.permissions.action_0"  :to="taskData.api_url+'/details/'+item.id" class="dropdown-item text-info btn-sm" ><i class="feather icon-camera"></i> {{labels.get('label_details')}}</router-link>
            </div>
          </td>
          <template v-for="(column,key) in taskData.columns.all">
            <td :class="((['id','quantity','unit_price','amount'].indexOf(key) != -1)?'text-right':'')+(column.class?(' '+column.class):'col_9')" v-if="taskData.columns.hidden.indexOf(key)<0" :key="'td_'+key">
              <template v-if="(['month'].indexOf(key) != -1)">
                {{labels.get('label_month_short_'+item[key])}}
              </template>
              <template  v-else>{{ item[key] }}</template>

            </td>
          </template>

        </tr>
        </tbody>
      </table>
      <Pagination :items = "taskData.items" :onChangePageOption="taskData.reloadItems" :pagination="taskData.pagination"/>
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
    import globalVariables from "@/assets/globalVariables";


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
      key='fiscal_year';
      columns[key]={
        label: labels.get('label_'+key),
        hideable:true,
        filterable:true,
        sortable:true,
        type:'dropdown',
        filter:{from:'',to:'',options:new Array(globalVariables.current_fiscal_year-globalVariables.sales_starting_year+1).fill().map((temp,index) => {return {value:globalVariables.current_fiscal_year-index,label:(globalVariables.current_fiscal_year-index)+' - '+(globalVariables.current_fiscal_year-index+1)}})}

      };
      key='month';
      columns[key] = {
        label: labels.get('label_'+key),
        hideable:true,
        filterable:true,
        sortable:true,
        type:'dropdown',
        filter:{from:'',to:'',options:new Array(12).fill().map((temp,index) => {return {value:index+1,label:labels.get('label_month_short_'+(index+1))}})},
      };
      key='part_name';
      columns[key]={
        label: labels.get('label_'+key),
        hideable:true,
        filterable:true,
        sortable:true,
        type:'dropdown',
        filter:{from:'',to:'',options:taskData.location_parts.map((item)=>{ return {value:item.name,label:item.name}}),}
      };
      key='area_name';
      columns[key]={
        label: labels.get('label_'+key),
        hideable:true,
        filterable:true,
        sortable:true,
        type:'text',
        filter:{from:'',to:''}
      };
      key='territory_name';
      columns[key]={
        label: labels.get('label_'+key),
        hideable:true,
        filterable:true,
        sortable:true,
        type:'text',
        filter:{from:'',to:''}
      };
      key='distributor_name';
      columns[key]={
        label: labels.get('label_'+key),
        hideable:false,
        filterable:true,
        sortable:true,
        type:'text',
        filter:{from:'',to:''}
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
      taskData.columns.all=columns
    }
    setColumns();
</script>

