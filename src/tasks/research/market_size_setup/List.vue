<template>
  <div class="card d-print-none mb-2">
    <div class="card-body">
      <div class="row mb-2">
        <div class="col-4">
          <label class="font-weight-bold float-right">{{labels.get('label_analysis_year')}} <span class="text-danger">*</span></label>
        </div>
        <div class="col-lg-4 col-8">
          <div class="input-group" >
            <select id="analysis_year_id" class="form-control">
              <option v-for="row in taskData.analysis_years" :value="row.id" :selected="row.id==taskData.analysis_year_id">
                {{row.name}}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>

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
              <router-link v-if="taskData.permissions.action_2"  :to="taskData.api_url+'/'+taskData.analysis_year_id+'/edit/'+item.id" class="dropdown-item text-info btn-sm" ><i class="feather icon-edit"></i> {{labels.get('label_edit')}}</router-link>
            </div>
          </td>
          <template v-for="(column,key) in taskData.columns.all">
            <td :class="((['id','ordering'].indexOf(key) != -1)?'text-right':'')+(column.class?(' '+column.class):'col_9')" v-if="taskData.columns.hidden.indexOf(key)<0" :key="'td_'+key">
              <router-link v-if="taskData.permissions.action_2"  :to="taskData.api_url+'/'+taskData.analysis_year_id+'/edit/'+item.id"> {{ item[key] }}</router-link>
              <router-link v-else  :to="taskData.api_url+'/'+taskData.analysis_year_id+'/details/'+item.id">{{ item[key] }}</router-link>
            </td>
          </template>

        </tr>
        </tbody>
      </table>
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
      let key='name';
      columns[key]={
        label: labels.get('label_'+key),
        hideable:true,
        filterable:true,
        sortable:true,
        type:'text',
        filter:{from:'',to:''}
      };
      key='total_type_entered';
      columns[key]={
        label: labels.get('label_'+key),
        hideable:true,
        filterable:false,
        sortable:true,
        type:'number',
        filter:{from:'',to:''},
        class:'col_1'
      };
      taskData.columns.all=columns
    }
    $(document).ready(function()
    {
      $(document).off("change", "#analysis_year_id");
      $(document).on("change",'#analysis_year_id',function()
      {
        router.push(taskData.api_url+'/'+$('#analysis_year_id').val())
        globalVariables.loadListData=true;
      })
    });
    setColumns();
</script>

