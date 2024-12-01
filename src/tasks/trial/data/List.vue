<template>
    <div class="card d-print-none mb-2">
      <div class="card-body">
        <div class="row mb-2">
          <div class="col-4">
            <label class="font-weight-bold float-right">{{labels.get('label_year')}} <span class="text-danger">*</span></label>
          </div>
          <div class="col-lg-4 col-8">
            <div class="input-group" >
              <select id="year" class="form-control">
                <option v-for="i in (globalVariables.current_year+2-globalVariables.starting_year)" :value="i+globalVariables.starting_year-1" :selected="(i+globalVariables.starting_year-1)==taskData.year">
                  {{i+globalVariables.starting_year-1}}
                </option>
              </select>
            </div>
          </div>
        </div>
        <div class="row mb-2">
          <div class="col-4">
            <label class="font-weight-bold float-right">{{labels.get('label_trial_station')}} <span class="text-danger">*</span></label>
          </div>
          <div class="col-lg-4 col-8">
            <div class="input-group" >
              <select id="trial_station_id" class="form-control">
                <option v-for="trial_station in taskData.trial_stations" :value="trial_station.id" :selected="trial_station.id==taskData.trial_station_id">
                  {{trial_station.name}}
                </option>
              </select>
            </div>
          </div>
        </div>
        <div class="row mb-2">
          <div class="col-4">
            <label class="font-weight-bold float-right">{{labels.get('label_season')}} <span class="text-danger">*</span></label>
          </div>
          <div class="col-lg-4 col-8">
            <div class="input-group" >
              <select id="season_id" class="form-control">
                <option value="0">{{labels.get('label_select')}}</option>
                <option v-for="season in taskData.seasons" :value="season.id" :selected="season.id==taskData.season_id">
                  {{season.name}}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  <div class="card mb-2">
    <div class="card-header d-print-none">
      {{taskData.cropInfo.name}}-{{taskData.formInfo.name}}
    </div>
    <div class="card-body" style='overflow-x:auto;min-height:250px;'>
      <table class="table table-bordered">
        <thead class="table-active">
        <tr>
          <th class="position-relative align-middle d-print-none">{{labels.get('label_action')}}</th>
          <template v-for="(column,key) in taskData.columns.all">
            <th class="position-relative align-middle" v-if="taskData.columns.hidden.indexOf(key)<0" :key="'th_'+key">
              <div class=" text-center " style="width:calc(100% - 33px);margin-left:17px">
                {{ column.label }}
              </div>
            </th>
          </template>
        </tr>
        </thead>
        <tbody class="table-striped table-hover">
        <tr v-for="item in taskData.items" :key="'item_'+item.id">
          <td class="col_1 d-print-none">
            <button class="btn btn-sm bg-gradient-primary dropdown-toggle waves-effect waves-light" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">{{labels.get('label_action')}}</button>
            <div class="dropdown-menu" aria-labelledby="dropdownMenuButton" x-placement="bottom-start" style="position: absolute; will-change: transform; top: 0; left: 0; transform: translate3d(0px, 38px, 0px);">
              <template v-if="taskData.formInfo.entry_count==1">
                <router-link :to="taskData.api_url+'/'+taskData.crop_id+'/'+taskData.form_id+'/'+taskData.trial_station_id+'/'+taskData.year+'/'+taskData.season_id+'/edit/'+item.variety_id+'/1'" class="dropdown-item text-info btn-sm" >
                  <template v-if="item.num_entry>0">
                    <i class="feather icon-edit"></i> {{labels.get('label_edit')}}
                  </template>
                  <template v-else>
                    <i class="feather icon-plus-circle"></i> {{labels.get('label_new')}}
                  </template>
                </router-link>
              </template>
              <template v-else-if="taskData.formInfo.entry_count==-1">
                <router-link v-for="edit_no in item.num_entry"  :to="taskData.api_url+'/'+taskData.crop_id+'/'+taskData.form_id+'/'+taskData.trial_station_id+'/'+taskData.year+'/'+taskData.season_id+'/edit/'+item.variety_id+'/'+edit_no" class="dropdown-item text-info btn-sm" ><i class="feather icon-edit"></i> {{labels.get('label_edit')+'-'+edit_no}}</router-link>
                <router-link :to="taskData.api_url+'/'+taskData.crop_id+'/'+taskData.form_id+'/'+taskData.trial_station_id+'/'+taskData.year+'/'+taskData.season_id+'/edit/'+item.variety_id+'/'+(item.num_entry+1)" class="dropdown-item text-info btn-sm" ><i class="feather icon-plus-circle"></i> {{labels.get('label_add_more')}}</router-link>
              </template>
              <template v-else>
                <router-link v-for="edit_no in taskData.formInfo.entry_count"  :to="taskData.api_url+'/'+taskData.crop_id+'/'+taskData.form_id+'/'+taskData.trial_station_id+'/'+taskData.year+'/'+taskData.season_id+'/edit/'+item.variety_id+'/'+edit_no" class="dropdown-item text-info btn-sm" >
                  <template v-if="item.entries.includes(edit_no.toString())">
                    <i class="feather icon-edit"></i> {{labels.get('label_edit')+'-'+edit_no}}
                  </template>
                  <template v-else>
                    <i class="feather icon-plus-circle"></i> {{labels.get('label_new')+'-'+edit_no}}
                  </template>

                </router-link>
              </template>
            </div>
          </td>
          <template v-for="(column,key) in taskData.columns.all">
            <td :class="((['num_data'].indexOf(key) != -1)?'text-right':'')+(column.class?(' '+column.class):' col_9')" v-if="taskData.columns.hidden.indexOf(key)<0" :key="'td_'+key">
              {{ item[key] }}
            </td>
          </template>

        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup>
    import globalVariables from "@/assets/globalVariables";
    import systemFunctions from "@/assets/systemFunctions";

    import labels from '@/labels'  
    import { inject,ref } from 'vue'
    import {useRouter} from 'vue-router';


    // import AddEdit from './AddEdit.vue'


    const router =useRouter()
    let taskData = inject('taskData')
    // let show_column_controls=ref(false)

    const setColumns=()=>{
      let columns={}
      let key='rnd_code';
      columns[key]={
        label: labels.get('label_'+key),
        hideable:true,
        filterable:true,
        sortable:true,
        type:'text',
        filter:{from:'',to:''}
      };
      key='num_entry';
      columns[key]={
        label: labels.get('label_'+key),
        hideable:true,
        filterable:true,
        sortable:true,
        type:'number',
        filter:{from:'',to:''},
        class:'col_1'
      };
      taskData.columns.all=columns
    }
    //
    const changeUrl=()=>{
      let year=$('#year').val();
      let trial_station_id=$('#trial_station_id').val();
      let season_id=$('#season_id').val();
      globalVariables.loadListData=true;
      taskData.items={}
      router.push(taskData.api_url+'/'+taskData.crop_id+'/'+taskData.form_id+'/'+trial_station_id+'/'+year+'/'+season_id)
    }
    $(document).ready(function()
    {
      $(document).off("change", "#year,#trial_station_id,#season_id");
      $(document).on("change",'#year,#trial_station_id,#season_id',function()
      {
        changeUrl();
      })
    });
    setColumns();
</script>

