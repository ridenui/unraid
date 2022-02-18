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
