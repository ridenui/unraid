export const isUserScriptRunningScript = (name) => `for script in \`ls /tmp/user.scripts/running/\`
do
    if [[ "${name}" == $script ]]; then
        pid=$(cat /tmp/user.scripts/running/$script)
        ps --pid $pid > /dev/null
        if [ "$?" -eq 0 ]; then
            exit 0;
        fi
    fi
done
exit 13`;

export const listUserscripts = () => `SECOND_ITERATION=""
SCHEDULE_JSON=$(cat /boot/config/plugins/user.scripts/schedule.json)
printf "%s" "["
for script in $(ls /boot/config/plugins/user.scripts/scripts)
do
    COMBINED_PATH=/boot/config/plugins/user.scripts/scripts/\${script%/}/
    SCRIPT_LOCATION=$(printf "%s%s" $COMBINED_PATH script)
    NAME_LOCATION=$(printf "%s%s" $COMBINED_PATH name)
    DESCRIPTION_LOCATION=$(printf "%s%s" $COMBINED_PATH description)
    PID_LOCATION="/tmp/user.scripts/running/\${script%/}"
    NAME=""
    DESCRIPTION=""
    SCRIPT=""
    OUTPUT=""
    RUNNING=""
    PID=""
    SCHEDULE=""
    if [[ -d "$COMBINED_PATH" ]]; then
        if [[ -f "$SCRIPT_LOCATION" ]]; then
            if [[ -f "$NAME_LOCATION" ]]; then
                NAME=$(cat $NAME_LOCATION)
            fi
            if [[ -f "$DESCRIPTION_LOCATION" ]]; then
                DESCRIPTION=$(cat $DESCRIPTION_LOCATION)
            fi
            SCRIPT=$(cat $SCRIPT_LOCATION)
            if [[ -z "$NAME" ]]; then
                NAME=\${script%/}
            fi
            if [[ -f "$PID_LOCATION" ]]; then
                PID=$(cat $PID_LOCATION)
                ps --pid $PID > /dev/null
                if [ "$?" -eq 0 ]; then
                    RUNNING=true
                else
                    RUNNING=false
                fi
            else
                RUNNING=false
            fi
            SCHEDULE=$(cat /boot/config/plugins/user.scripts/schedule.json | jq -r --arg script "$SCRIPT_LOCATION" '.[$script]')
            if [[ -z "$DESCRIPTION" ]]; then
                OUTPUT=$(jq -n --arg name "$NAME" --arg dirName "\${script%/}" --argjson running "$RUNNING" --arg script "$SCRIPT" --argjson schedule "$SCHEDULE" '$ARGS.named')
            else
                OUTPUT=$(jq -n --arg name "$NAME" --arg dirName "\${script%/}" --argjson running "$RUNNING" --arg script "$SCRIPT" --arg description "$DESCRIPTION" --argjson schedule "$SCHEDULE" '$ARGS.named')
            fi
            if [[ -z "$SECOND_ITERATION" ]]; then
                printf "%s" "$OUTPUT"
                SECOND_ITERATION=true
            else
                printf ",%s" "$OUTPUT"
            fi
        fi 
    fi
done
printf "%s" "]"`;
