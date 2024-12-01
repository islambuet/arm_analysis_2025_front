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
  <div v-if="taskData.trial_station_id>0 && taskData.year>0 && taskData.season_id>0">
    <AddEdit/>
  </div>
</template>
<script setup>
    import globalVariables from "@/assets/globalVariables";
    import systemFunctions from "@/assets/systemFunctions";

    import labels from '@/labels'  
    import { inject,ref } from 'vue'
    import {useRouter} from 'vue-router';


    import AddEdit from './AddEdit.vue'


    const router =useRouter()
    let taskData = inject('taskData')
    let show_column_controls=ref(false)

    const changeUrl=()=>{
      let year=$('#year').val();
      let trial_station_id=$('#trial_station_id').val();
      let season_id=$('#season_id').val();
      globalVariables.loadListData=true;
      taskData.itemsPending={}
      router.push(taskData.api_url+'/'+trial_station_id+'/'+year+'/'+season_id)
    }
    $(document).ready(function()
    {
      $(document).off("change", "#year,#trial_station_id,#season_id");
      $(document).on("change",'#year,#trial_station_id,#season_id',function()
      {
        changeUrl();
      })
    });
</script>

